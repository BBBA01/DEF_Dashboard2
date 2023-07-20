import React, { useEffect, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import css from "./StatisticsChart2.module.css";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faFileExcel,
  faFilePdf,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.png";
import { DateRangePicker } from 'rsuite';
import "rsuite/dist/rsuite.css";

const StatisticsChart2 = ({ themeMode, selectedRange }) => {
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState([new Date("2023-01-01"), new Date("2023-06-01")]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const iconContainerRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const iconRef = useRef(null);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state on window resize
  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    // Add a window resize event listener
    window.addEventListener('resize', handleWindowResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedRange, selectedOffice, isAdmin]);

  const fetchData = () => {
    setIsLoading(true);
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);


    axios
      .get(`http://115.124.120.251:5059/api/Sales`)
      .then((response) => {
        const { data } = response;
        console.log("API response data:", data);
  
        if (Array.isArray(data)) {
          const filteredData = data
            .filter((item) => item.invoiceDate >= startDate && item.invoiceDate <= endDate)
            .reduce((acc, item) => {
              const officeName = item.officeName.replace(/\[Def Fluid Pump\]/g, ""); // Remove the "[Def Fluid Pump]" text using a regular expression
              const formattedDate = item.invoiceDate.split("T")[0]; // Extract date portion
              const existingItem = acc.find((x) => x.officeName === officeName);
              if (existingItem) {
                existingItem.total += item.total;
              } else {
                acc.push({ officeName, total: item.total, invoiceDate: formattedDate });
              }
              return acc;
            }, []);
  
          setChartData(filteredData);
        } else {
          console.error("Invalid data format:", data);
          // You can display an error message to the user or handle the error in an appropriate way
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error.response.data);
        // You can display an error message to the user or handle the error in an appropriate way
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false after the data is loaded or in case of an error
      });
  };
  
  
  
  
  

  const nonZeroSalesData = chartData.filter((item) => item.sales > 0);
  const averageSales = (
    nonZeroSalesData.reduce((total, item) => total + item.sales, 0) /
    nonZeroSalesData.length
  ).toFixed(2);

  const handleDateRange = (value) => {
    if (value == null) {
      setDateRange([null, null]); // Clear the dateRange value
    } else {
      setDateRange(value);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return ''; // Return an empty string or a default date string
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const option = {
    color: ["#FF7043"],
    title: {
      text: "Total Sales by Office",
      textStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: windowWidth <= 768 ? 18 : 25,
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: "<b>Office:</b> {b} <br> <b>Sales:</b> {c} ",
      textStyle: {
        fontSize: windowWidth <= 768 ? 10 : 14,
      },
    },
    yAxis: {
      type: "category",
      name: "Office Name",
      nameLocation: "middle",
      nameGap: 100,
      nameTextStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontWeight: "bold",
        fontSize: windowWidth <= 768 ? 14 : 20,
      },
      data: chartData.map((item) => item.officeName),
      axisLine: {
        lineStyle: {
          color: themeMode === "dark" ? "#ffffff" : "#000000",
        },
      },
      axisLabel: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: 12,
        // Implement a custom formatter function to make the yAxis labels shorter
        formatter: (value) => {
          // Custom logic to make labels shorter, e.g., show only the first 10 characters
          return value.length > 10 ? value.substring(0, 10) + "..." : value;
        },
      },
    },
    grid: {
      left: 120, // Adjust the left margin to give space for the y-axis labels
      right: 30,
      bottom: 50,
      top: 70,
    },
    xAxis: {
      type: "value",
      name: "Sales",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontWeight: "bold",
        fontSize: windowWidth <= 768 ? 14 : 20,
      },
      axisLine: {
        lineStyle: {
          color: themeMode === "dark" ? "#ffffff" : "#000000",
        },
      },
      axisLabel: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        formatter: (value) => {
          if (value >= 10000) {
            return (value / 1000) + "k";
          } else {
            return value;
          }
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: themeMode === "dark" ? "grey" : "silver",
          type: "line",
        },
      },
      
     
    },
    series: [
      {
        type: "bar",
        barWidth: "50%",
        data: chartData.map((item) => item.total.toFixed(2)),
      },
    ],
  };

 

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  
  
  const exportToExcel = async () => {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Total Sales by Office");
  
    // Add the image file
    const response = await axios.get(logo, {
      responseType: "arraybuffer",
    });
  
    // Convert image buffer to base64 string
    const imageBase64 = arrayBufferToBase64(response.data);

  
    // Add the image to the workbook
    const logoImage = workbook.addImage({
      base64: imageBase64,
      extension: "png",
    });
    worksheet.addImage(logoImage, {
      tl: { col: 0, row: 0 },
      ext: { width: 40, height: 40 },
    });
  
    // Add extra header - Sales-Expense Summary
    const extraHeaderCell = worksheet.getCell("A1");
    extraHeaderCell.value = "Total Sales by Office";
    extraHeaderCell.font = {
      bold: true,
      color: { argb: "000000" }, // Black color
      size: 14,
    };
    extraHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells("A1:C1");
  
   // Add period - startDate to endDate
   const periodCell = worksheet.getCell("A2");
   periodCell.value = `Period: ${startDate} to ${endDate}`;
   periodCell.font = {
     bold: true,
     color: { argb: "000000" }, // Black color
     size: 12,
   };
   periodCell.alignment = { horizontal: "center" }; // Center alignment
   worksheet.mergeCells("A2:C2");

    // Set column widths
    worksheet.getColumn(1).width = 50;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;
  
    // Add headers
    const headerRow = worksheet.addRow(["Office Name", "Sales"]);
    headerRow.font = { bold: true };
  
    // Add data rows
    chartData.forEach((item) => {
      worksheet.addRow([item.officeName, item.total]);
    });

    // Add the total row
    const totalRow = worksheet.addRow(["Total", ""]);
    totalRow.font = {
      bold: true,
      color: { argb: "000000" }, // Black color
      size: 12,
    };

   // Calculate total value
const totalSales = chartData.reduce((total, item) => total + parseFloat(item.total), 0);

// Set total value in the total row
const totalSalesCell = worksheet.getCell(`B${totalRow.number}`);
totalSalesCell.value = `₹${totalSales}`;
totalSalesCell.numFmt = "0.00";
totalSalesCell.alignment = { horizontal: "right" };

  
    // Generate a Blob from the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBlob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(excelBlob, "total_sales_by_office.xlsx");
    });
  };
  

  const exportToPDF = async () => {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);
    // Add image file
    const response = await axios.get(logo, {
      responseType: "arraybuffer",
    });
    const imageBase64 = arrayBufferToBase64(response.data);
  
    const doc = new jsPDF();
  
    // Add the image
    const imgData = imageBase64;
    const imgWidth = 20;
    const imgHeight = 20;
    doc.addImage(imgData, "PNG", 15, 5, imgWidth, imgHeight);
  
    // Add Sales-Expense Summary header
    const summaryHeader = [["Total Sales by Office"]];
    doc.autoTable({
      startY: 27,
      head: summaryHeader,
      body: [],
      headStyles: {
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
        fillColor: "#3CB043", // Green color for Sales-Expense Summary header
        textColor: "#FFFFFF", // White color
      },
      margin: { top: 20, bottom: 0 }, // Move it a little down after the image
    });
  
    // Add period - startDate to endDate
    const periodCell = [[`Period: ${startDate} to ${endDate}`]];
    doc.autoTable({
      startY: 36,
      head: periodCell,
      body: [],
      headStyles: {
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
        fillColor: "#3CB043",
        textColor: "#FFFFFF",
      },
      margin: { top: 30 }, // Move it upwards and provide some space at the bottom
    });
  
    // Convert chart data to table format
    const tableData = chartData.map((item) => [
      item.officeName,
      parseFloat(item.total.toFixed(2)),
    ]);
  
    // Calculate total sales
    const totalSales = chartData.reduce(
      (total, item) => total + parseFloat(item.total),
      0
    );
  
    // Add total row
    tableData.push(["Total", `₹${totalSales.toFixed(2)}`]);
  
    // Set table headers
    const headers = ["Office Name", "Sales"];
  
    // Set header styles
    const headerStyles = {
      fontSize: 12,
      fontStyle: "bold",
      halign: "center",
      fillColor: "#75AAF0", // Sky blue color for Office Name, Sales header
      textColor: "#FFFFFF", // White color
    };
  
    // Add table to PDF
    doc.autoTable(headers, tableData, {
      startY: 45, // Start below the header and period
      headStyles: headerStyles,
    });
  
    // Save PDF
    doc.save("total_sales_by_office.pdf");
  };
  

  const exportToTable = async () => {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);
    // Determine the mode (e.g., based on a user preference or a toggle)
    const isDarkMode = true; // Set to true for dark mode, false for light mode
  
    // Hide the graph
    const graphContainer = document.querySelector(`.${css.chartContainer}`);
    graphContainer.style.opacity = "0";
    graphContainer.style.transition = "opacity 0.3s";
    graphContainer.style.display = "none";
  
    // Generate the table data
    const tableData = chartData.map((item) => ({
      OfficeName: item.officeName,
      Sales: item.total.toFixed(2),
    }));
  
    // Calculate total sales
    const totalSales = chartData.reduce(
      (total, item) => total + parseFloat(item.total),
      0
    );
  
    // Add total row
    tableData.push({ OfficeName: "Total", Sales: `₹${totalSales.toFixed(2)}` });
  
    // Create a new element to hold the table
    const tableContainer = document.createElement("div");
    tableContainer.className = css.tableContainer;
    tableContainer.style.opacity = "0";
    tableContainer.style.transition = "opacity 0.3s";
  
    // Create the table element
    const table = document.createElement("table");
    table.className = `${css.table} ${isDarkMode ? "darkMode" : "lightMode"}`;
  
    // Create the table header
    const tableHeader = document.createElement("thead");
    const tableHeaderRow = document.createElement("tr");
    tableHeaderRow.innerHTML = `
      <th colspan="2" class="${css.summaryHeader}">Total Sales by Office</th>
    `;
    tableHeader.appendChild(tableHeaderRow);
  
    // Add the period header
    const periodHeaderRow = document.createElement("tr");
    periodHeaderRow.innerHTML = `
      <th colspan="2" class="${css.periodHeader}">Period: ${startDate} to ${endDate}</th>
    `;
    tableHeader.appendChild(periodHeaderRow);
  
    const secondHeaderRow = document.createElement("tr");
    secondHeaderRow.innerHTML = `
      <th class="${css.headerCell}">Office Name</th>
      <th class="${css.headerCell}">Sales</th>
    `;
    tableHeader.appendChild(secondHeaderRow);
  
    // Create the table body
    const tableBody = document.createElement("tbody");
    tableData.forEach((rowData) => {
      const tableRow = document.createElement("tr");
      Object.values(rowData).forEach((cellData) => {
        const tableCell = document.createElement("td");
        tableCell.textContent = cellData;
        tableRow.appendChild(tableCell);
      });
      tableBody.appendChild(tableRow);
    });
  
    // Append the table header and body to the table
    table.appendChild(tableHeader);
    table.appendChild(tableBody);
  
    // Append the table to the table container
    tableContainer.appendChild(table);
  
    // Create a close button to hide the table and show the graph
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.className = css.closeButton;
    closeButton.addEventListener("click", () => {
      // Add a fade-out animation to the table wrapper and close button
      tableWrapper.style.opacity = "0";
      tableWrapper.style.transition = "opacity 0.3s";
  
      // Remove the table wrapper after the animation completes
      setTimeout(() => {
        tableWrapper.remove();
        // Show the graph with a smooth animation
        graphContainer.style.display = "flex";
        setTimeout(() => {
          graphContainer.style.opacity = "1";
        }, 10);
      }, 300);
    });
  
    // Create a wrapper element to hold the table and close button
    const tableWrapper = document.createElement("div");
    tableWrapper.className = css.tableWrapper;
    tableWrapper.appendChild(tableContainer);
    tableWrapper.appendChild(closeButton);
  
    // Insert the table wrapper below the graph container
    graphContainer.parentNode.insertBefore(
      tableWrapper,
      graphContainer.nextSibling
    );
  
    // Show the table with a smooth animation
    setTimeout(() => {
      tableContainer.style.opacity = "1";
    }, 10);
  };
  

  useEffect(() => {
    function handleClick(event) {
      // Check if the click target or any of its parents match the iconContainer or iconRef
      if (
        (iconContainerRef.current &&
          iconContainerRef.current.contains(event.target)) ||
        (iconRef.current && iconRef.current.contains(event.target))
      ) {
        setShowExportOptions(true);
      } else {
        setShowExportOptions(false);
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleIconClick = () => {
    setShowExportOptions(true);
  };

  const handleOfficeChange = (event) => {
    const selectedOption = event.target.selectedOptions[0];
    const isRetail = selectedOption.getAttribute("data-isretail");
    const isAdmin = selectedOption.getAttribute("data-isadmin");
  
    setSelectedOffice(event.target.value);
    setIsAdmin(isAdmin);
    console.log(selectedOption)
  
    // Make the API call with the updated selectedOffice and isAdmin values
    fetchData();
  };


  

  return (
    <div
      className={`${css.chartContainer} ${
        themeMode === "dark" ? css.darkMode : css.lightMode
      }`}
    >
      {/* <div className={css.topContainer}>
        <div
          className={`${css.dateFilter} ${
            themeMode === "dark" ? css.darkMode : css.lightMode
          }`}
        >
          <label>Date Range:</label>
          <DateRangePicker
            style={{ width: 230, color: 'black' }}
            value={dateRange}
            onChange={handleDateRange}
            appearance="subtle"
            className="custom-date-range-picker"
            
          />
        </div>
         <div className={`${css.officefilter} ${
            themeMode === "dark" ? css.darkMode : css.lightMode
          }`}>
          <label htmlFor="office">Office :</label>
          <div>
            <select
              name="office"
              id="office"
              className="form-control"
              value={selectedOffice}
              onChange={handleOfficeChange}
            >
              <option
                value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                data-isretail="-1"
                data-isadmin="6"
              >
                All Entities
              </option>
              <option
                value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                data-isretail="0"
                data-isadmin="4"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;All Companies
              </option>
              <option
                value="46a1c7b7-6885-4f74-7ade-08dafe23c727"
                data-isretail="0"
                data-isadmin="5"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Deep Lubricants
              </option>
              <option
                value="43fe68e8-c233-4f4e-4c73-08db2523436a"
                data-isretail="0"
                data-isadmin="5"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DIVOL PETRO
                CHEM
              </option>
              <option
                value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                data-isretail="-1"
                data-isadmin="1"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;All Pumps
              </option>
              <option
                value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                data-isretail="0"
                data-isadmin="3"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WholeSale Pumps
              </option>
              <option
                value="d5cda415-8955-4816-775d-08db46684854"
                data-isretail="0"
                data-isadmin="0"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Ashok Urea filling station
              </option>
              <option
                value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                data-isretail="1"
                data-isadmin="2"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Retail Pumps
              </option>
              <option
                value="c50dbaa3-fa99-4bf8-7adf-08dafe23c727"
                data-isretail="1"
                data-isadmin="0"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Varanasi
                Pump
              </option>
              <option
                value="8496841d-d292-4e51-4c72-08db2523436a"
                data-isretail="1"
                data-isadmin="0"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SMS
                shop
              </option>
            </select>
          </div>
        </div> 
      </div> */}
      <div className={css.iconsContainer} ref={iconContainerRef}>
        {/* Data grid icon */}
        <div
          className={`${css.icon} ${
            themeMode === "dark" ? css.darkMode : css.lightMode
          }`}
          ref={iconRef}
          onClick={handleIconClick}
        >
          <FontAwesomeIcon icon={faTable} size="lg" />
        </div>
        {showExportOptions && (
          <div
            className={`${css.exportOptions} ${
              themeMode === "dark" ? css.darkMode : css.lightMode
            }`}
            ref={exportOptionsRef}
          >
            <div className={css.exportOption} onClick={exportToExcel}>
              <FontAwesomeIcon icon={faFileExcel} size="lg" />
              <span>Export to Excel</span>
            </div>
            <div className={css.exportOption} onClick={exportToPDF}>
              <FontAwesomeIcon icon={faFilePdf} size="lg" />
              <span>Export to PDF</span>
            </div>
            <div className={css.exportOption} onClick={exportToTable}>
              <FontAwesomeIcon icon={faTable} size="lg" />
              <span>Export to Table</span>
            </div>
          </div>
        )}
      </div>
      {/* Loading spinner */}
      {isLoading && (
        <div className={css.loadingOverlay}>
          <FontAwesomeIcon icon={faSpinner} spin className={css.loadingSpinner} />
        </div>
      )}
      <ReactECharts
        option={option}
        style={{ height: "500px", width: "100%", maxWidth: "2300px", marginTop: "0px"  }}
        className={themeMode === "dark" ? css.darkMode : css.lightMode}
      />
    </div>
  );
};

export default StatisticsChart2;
