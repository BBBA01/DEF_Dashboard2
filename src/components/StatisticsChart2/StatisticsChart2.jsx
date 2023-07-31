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
  faXmark,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.png";
import { DateRangePicker } from 'rsuite';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import "rsuite/dist/rsuite.css";
import MUIDataTable from "mui-datatables";

const StatisticsChart2 = ({ themeMode, selectedRange, selectedOffice, isAdmin,SelectedOfficeName }) => {
  const [chartData, setChartData] = useState([]);

  const [showExportOptions, setShowExportOptions] = useState(false);
  const iconContainerRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const iconRef = useRef(null);


  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [tableStatus, setTableStatus] = useState(false)
  const [tableData, setTableData] = useState([])



  const columns = [{ name: "officeName", label: "Office" }, {name:"sales",label:"Sales(₹)"}];

  const options = {
    // filterType: 'checkbox',
    selectableRowsHeader: false,
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
    search: false,
    responsive: 'standard',
    selectableRows: "none",
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 25, 50],
    tableBodyHeight: "228px",
    elevation: 0,
    fixedHeader: false,
    textLabels: {
      pagination: {
        rowsPerPage: "Rows"
      }
    }
  };

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
      .get(
        `http://115.124.120.251:5064/api/v1/dashboard/sales_list/${startDate}/${endDate}/${selectedOffice}/${isAdmin}`
      )
      .then((response) => {
        const { data } = response;
        console.log("API response data:", data);
        let result = {}

        data.graph1.forEach((item) => {
          const { lstOffice } = item;
          
          lstOffice.forEach((office) => {
            let { officeName, totalIncome } = office;
            if (totalIncome !== 0) {
              if (result[officeName]) {
                result[officeName] += totalIncome;
              } else {
                result[officeName] = totalIncome;
              }
            }
          }
          )

          if (item.totalIncome > 0 && lstOffice.length==0) {
            if(result[SelectedOfficeName]){
            result[SelectedOfficeName] += item.totalIncome;}
            else{
              result[SelectedOfficeName] = item.totalIncome
            }
          }


        })
        if (result) {
          let temp = []
          let tabletemp=[]
          for (let key in result) {
            temp.push({
              "officeName": key,
              "sales": result[key],
            });
            tabletemp.push({
              "officeName": key,
              "sales": result[key],
            });
          }
          tabletemp.push({"officeName":"Total","sales": temp.reduce((sales, item) => sales + parseFloat(item.sales), 0)})

          setTableData(tabletemp)
          setChartData(temp)
        
        }
        // if (Array.isArray(data.graph1)) {
        //   const filteredData = data.graph1.map((item) => {
        //     // Access the first officeName directly, instead of mapping the whole array
        //     const officeName = item.lstOffice[0]?.officeName || "";

        //     return {
        //       requestedDate: item.requestedDate,
        //       sales: item.totalIncome,
        //       officeName: officeName,
        //     };
        //   });

        //   // Filter out entries where sales is 0
        //   const nonZeroSalesData = filteredData.filter((item) => item.sales > 0);

        //   // Group the data by officeName
        //   const groupedData = nonZeroSalesData.reduce((acc, item) => {
        //     if (!acc[item.officeName]) {
        //       acc[item.officeName] = 0;
        //     }
        //     acc[item.officeName] += parseFloat(item.sales);
        //     return acc;
        //   }, {});

        //   // Convert the grouped data back to an array of objects
        //   const combinedChartData = Object.keys(groupedData).map((officeName) => ({
        //     officeName: officeName,
        //     sales: groupedData[officeName],
        //   }));

        //   setChartData(combinedChartData);
        // } else {
        //   // console.log("Invalid data format:", data);
        // }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };








  const option = {
    color: ["#FF7043"],
    title: {

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
      name: window.innerWidth > 550 ? "" : "",
      nameLocation: "middle",
      nameGap: 80,
      nameTextStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontWeight: "bold",
        fontSize: windowWidth <= 768 ? 14 : 16,
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
          return windowWidth <= 768 ?value.length > 10 ? value.substring(0, 10) + "..." : value:value.length > 0 ? value.substring(0, 10) + "..." : value;
        },
      },
    },
    grid: {
      left: windowWidth <= 768 ? 85 : 100, // Adjust the left margin to give space for the y-axis labels
      right: 20,
      bottom: 50,
      top: 15,
    },
    xAxis: {
      type: "value",
      name: window.innerWidth > 550 ? "Sales" : "",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontWeight: "bold",
        fontSize: windowWidth <= 768 ? 14 : 16,
      },


      axisLine: {
        lineStyle: {
          color: themeMode === "dark" ? "#ffffff" : "#000000",
        },
      },
      axisLabel: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        formatter: (value) => {
          if (value >= 1000) {
            return (value / 1000) + "k";
          } else {
            return value;
          }
        },
        rotate: windowWidth<=768?45:0,
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
        barWidth: "25%",
        data: chartData.map((item) => item.sales),
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
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
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
      worksheet.addRow([item.officeName, item.sales]);
    });

    // Add the total row
    const totalRow = worksheet.addRow(["Total", ""]);
    totalRow.font = {
      bold: true,
      color: { argb: "000000" }, // Black color
      size: 12,
    };

    // Calculate total value
    const totalSales = chartData.reduce((sales, item) => sales + parseFloat(item.sales), 0);

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
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
    // Add image file
    const response = await axios.get(logo, {
      responseType: "arraybuffer",
    });
    const imageBase64 = arrayBufferToBase64(response.data);

    const doc = new jsPDF();

    // Add the image
    const imgData = imageBase64;
    const imgWidth = 35;
    const imgHeight = 20;
    doc.addImage(imgData, "PNG", 15, 9, imgWidth, imgHeight);

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
      parseFloat(item.sales.toFixed(2)),
    ]);

    // Calculate total sales
    const totalSales = chartData.reduce(
      (sales, item) => sales + parseFloat(item.sales),
      0
    );

    // Add total row
    tableData.push(["Total", `${totalSales.toFixed(2)}`]);

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
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
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
      Sales: item.sales,
    }));

    // Calculate total sales
    const totalSales = chartData.reduce(
      (sales, item) => sales + parseFloat(item.sales),
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
        // setShowExportOptions(true);
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
    setShowExportOptions(!showExportOptions);
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



  return (
    <div
      className={`${css.chartContainer} ${themeMode === "dark" ? css.darkMode : css.lightMode
        }`}
    >
      <Container fluid >
        <Row className="text-left w-100 g-0 align-items-center">
          <Col className={`fw-bold fs-${windowWidth <= 768 ? 6 : 5} d-flex label-text`} >Total Sales by Office</Col>
          <Col className=" text-end justify-content-end d-flex g-0" ><div className={`${css.iconsContainer} d-flex justify-content-center align-items-center`} ref={iconContainerRef}>
            {/* Data grid icon */}
            {!tableStatus ?
            <div
              className={`${css.icon} ${themeMode === "dark" ? css.darkMode : css.lightMode
                }`}
              ref={iconRef}
              onClick={handleIconClick}
            >
              {showExportOptions ? <FontAwesomeIcon icon={faXmark} size="lg" /> : <FontAwesomeIcon icon={faList} size="lg" />}
            </div>:
              <div
              className={`${css.icon} ${themeMode === "dark" ? css.darkMode : css.lightMode
                }`}
              ref={iconRef}
              onClick={() => { setTableStatus(!tableStatus) }}
            >
              <div><FontAwesomeIcon icon={faXmark} size="lg" />
              </div>
            </div>
            }
            {showExportOptions && (
              <div
                className={`${css.exportOptions} ${themeMode === "dark" ? css.darkMode : css.lightMode
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
                <div className={css.exportOption} onClick={()=>{setTableStatus(!tableStatus);setShowExportOptions(false)}}>
                  <FontAwesomeIcon icon={faTable} size="lg" />
                  <span>Export to Table</span>
                </div>
              </div>
            )}
          </div></Col>
        </Row>
      </Container>




      {/* Loading spinner */}
      {isLoading && (
        <div className={css.loadingOverlay}>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className={css.loadingSpinner}
          />
        </div>
      )}
      {!tableStatus?<ReactECharts
        option={option}
        style={{

          height: "300px",
          width: "100%",
          maxWidth: "2300px",
        }}
        className={themeMode === "dark" ? css.darkMode : css.lightMode}
      />:
      <div className="container-fluid mt-2">
      <MUIDataTable
        // title={"Employee List"}
        data={tableData}
        columns={columns}
        options={options}
      />
    </div>}
    </div>
  
  );
};

export default StatisticsChart2;