import React, { useEffect, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import css from "./StatisticsChart.module.css";
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
import officeData from "../../data/officeData.json";
import { DateRangePicker } from 'rsuite';
import "rsuite/dist/rsuite.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { differenceInDays } from 'date-fns';


const StatisticsChart = ({ selectedRange, themeMode, selectedOffice, isAdmin }) => {
  const [chartData, setChartData] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const iconContainerRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const iconRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isBarChart, setIsBarChart] = useState(true); // State to track the chart type
  const [selectedRangeDays, setSelectedRangeDays] = useState(7);

  

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
    setIsLoading(true); // Set loading state to true before making the API call
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);

    axios
      .get(
        `http://115.124.120.251:5059/api/Dashboard/DEFDashBoardGraphData/${startDate}/${endDate}/${selectedOffice}/${isAdmin}`
      )
      .then((response) => {
        const { data } = response;
        console.log("API response data:", data);

        if (Array.isArray(data.graph1)) {
          const filteredData = data.graph1.map((item) => ({
            requestedDate: item.requestedDate,
            sales: item.totalIncome,
            expense: item.totalExpense,
          }));

          setChartData(filteredData);
        } else {
          console.error("Invalid data format:", data);
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


  

  

  useEffect(() => {
    // Calculate the number of days between start and end dates
    if (selectedRange[0] && selectedRange[1]) {
      const startDate = new Date(selectedRange[0]);
      const endDate = new Date(selectedRange[1]);
      const days = differenceInDays(endDate, startDate) + 1; // +1 to include the end date
  
      // Check if the number of days is 7 or less to decide the chart type
      setIsBarChart(days <= 7);
      setSelectedRangeDays(days);
    }
  }, [selectedRange]);
  

  const option = {
    color: ["#FF7043", "#2979FF", "#FFC107"],
    title: {
     

      textStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: windowWidth <= 768 ? 18 : 25,

      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        var tooltip = "<b>Date:</b> " + params[0].name + "<br/>";
        for (var i = 0; i < params.length; i++) {
          tooltip +=
            "<b>" + params[i].seriesName + ":</b> " + params[i].value + "<br/>";
        }
        return tooltip;
      },
      textStyle: {
        fontSize: windowWidth <= 768 ? 10 : 14,
      },
    },
    legend: {
      top: 465,

      data: ["Sales", "Expense", "Average Sales"],
      textStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: windowWidth <= 768 ? 12 : 18,
      }
    },
    grid: {
      left: windowWidth <= 768 ? '7%' : '3%',
      right: "3%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "Date",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontWeight: "bold",
        fontSize: windowWidth <= 768 ? 14 : 20,
      },
      boundaryGap: true,
      data: chartData.map((item) => item.requestedDate),
      axisLine: {
        lineStyle: {
          color: themeMode === "dark" ? "#ffffff" : "#000000",
        },
      },
      axisLabel: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Sales",
        nameLocation: "middle",
        nameGap: 42,
        
       
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
            type: "dashed",
          },
        },
      },
      {
        type: "value",
        show: false,
      },
      {
        type: "value",
        show: false,
      },
    ],
    series: isBarChart // Conditional check for the chart type
      ? [
          {
            name: "Sales",
            type: "bar", // Display as a bar chart if the selected range is 7 days or less
            data: chartData.map((item) => item.sales),
            yAxisIndex: 0,
          },
          {
            name: "Expense",
            type: "bar", // Display as a bar chart if the selected range is 7 days or less
            data: chartData.map((item) => item.expense),
            yAxisIndex: 0,
          },
          {
            name: "Average Sales",
            type: "line", // Display as a line chart if the selected range is 7 days or less
            yAxisIndex: 0,
            smooth: true,
            lineStyle: {
              color: "#FFC107",
              width: 2,
              type: "dashed",
            },
            data: chartData.map(() => averageSales),
          },
        ]
      : [
          {
            name: "Sales",
            type: "line", // Display as a line chart if the selected range is more than 7 days
            smooth: true,
            data: chartData.map((item) => item.sales),
            yAxisIndex: 0,
          },
          {
            name: "Expense",
            type: "line", // Display as a line chart if the selected range is more than 7 days
            smooth: true,
            data: chartData.map((item) => item.expense),
            yAxisIndex: 0,
          },
          {
            name: "Average Sales",
            type: "line", // Display as a line chart if the selected range is more than 7 days
            yAxisIndex: 0,
            smooth: true,
            lineStyle: {
              color: "#FFC107",
              width: 2,
              type: "dashed",
            },
            data: chartData.map(() => averageSales),
          },
        ],
  };

  const exportToExcel = async () => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Graph Data");

    // Fetch the image file
    const response = await axios.get("logo.png", {
      responseType: "blob",
    });

    // Convert image file to base64 string
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const imageBase64 = fileReader.result;

      // Add the image to the workbook
      const logoImage = workbook.addImage({
        base64: imageBase64,
        extension: "png",
      });
      worksheet.addImage(logoImage, {
        tl: { col: 0, row: 0 }, // Adjusted offset values for padding
        ext: { width: 40, height: 40 },
      });

      // Add extra header - Sales-Expense Summary
      const extraHeaderCell = worksheet.getCell("A1");
      extraHeaderCell.value = "Sales-Expense Summary";
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
      const headerRow = worksheet.addRow(["Date", "Sales", "Expense"]);
      headerRow.font = {
        bold: true,
        color: { argb: "000000" }, // Black color
        size: 12,
        underline: true,
      };

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: "000000" }, // Black color
          size: 12,
        };
        cell.border = {
          bottom: { style: "thin", color: { argb: "000000" } }, // Black color
        };
      });

      // Filter chartData to exclude sales or expense values with zero
      const filteredData = chartData.filter((item) => item.sales !== 0 && item.expense !== 0);

      // Add data rows
      filteredData.forEach((item) => {
        const row = worksheet.addRow([
          item.requestedDate, // Convert to a Date object
          Number(item.sales), // Convert to a Number
          Number(item.expense), // Convert to a Number
        ]);

        // Set the number format for sales and expense columns
        row.getCell(2).numFmt = "0.00"; // Sales
        row.getCell(3).numFmt = "0.00"; // Expense
      });

      // Add the total row
      const totalRow = worksheet.addRow(["Total", "", ""]);
      totalRow.font = {
        bold: true,
        color: { argb: "000000" }, // Black color
        size: 12,
      };

      // Calculate total values
      const totalSales = filteredData.reduce((total, item) => total + item.sales, 0);
      const totalExpense = filteredData.reduce((total, item) => total + item.expense, 0);

      // Set total values in the total row
      const totalSalesCell = worksheet.getCell(`B${totalRow.number}`);
      totalSalesCell.value = `₹${totalSales.toFixed(2)}`;
      totalSalesCell.alignment = { horizontal: "right" }; // Align to the right

      const totalExpenseCell = worksheet.getCell(`C${totalRow.number}`);
      totalExpenseCell.value = `₹${totalExpense.toFixed(2)}`;
      totalExpenseCell.alignment = { horizontal: "right" }; // Align to the right

      // Generate a Blob from the workbook
      workbook.xlsx.writeBuffer().then((buffer) => {
        const excelBlob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(excelBlob, "graph_data.xlsx");
      });
    };
    fileReader.readAsDataURL(response.data);
  };


  const exportToPDF = () => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
    const doc = new jsPDF();

    // Add the image
    const imgData = "logo.png"; // Replace with the path or URL of your image file
    const imgWidth = 20;
    const imgHeight = 20;
    doc.addImage(imgData, "PNG", 15, 5, imgWidth, imgHeight);

    // Add Sales-Expense Summary header
    const summaryHeader = [["Sales-Expense Summary"]];
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

    // Filter out rows with zero sales and expense values
    const filteredData = chartData.filter(
      (item) => item.sales !== 0 || item.expense !== 0
    );

    // Convert filtered chart data to table format
    const tableData = filteredData.map((item) => [
      item.requestedDate,
      parseFloat(item.sales),
      parseFloat(item.expense),
    ]);

    // Calculate totals
    const salesTotal = filteredData.reduce((total, item) => total + item.sales, 0);
    const expenseTotal = filteredData.reduce(
      (total, item) => total + item.expense,
      0
    );

    // Add totals row if there are non-zero values
    if (salesTotal !== 0 || expenseTotal !== 0) {
      tableData.push([
        "Total",
        `₹${salesTotal.toFixed(2)}`,
        `₹${expenseTotal.toFixed(2)}`,
      ]);
    }

    // Set table headers
    const headers = ["Date", "Sales", "Expense"];

    // Set header styles
    const headerStyles = {
      fontSize: 12,
      fontStyle: "bold",
      halign: "center",
      fillColor: "#75AAF0", // Sky blue color for Date, Expense, Sales header
      textColor: "#FFFFFF", // White color
    };

    // Add table to PDF
    doc.autoTable(headers, tableData, {
      startY: 45, // Start below the header and period
      headStyles: headerStyles,
    });

    // Save PDF
    doc.save("graph_data.pdf");
  };


  const exportToTable = () => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);
    // Determine the mode (e.g., based on a user preference or a toggle)
    const isDarkMode = true; // Set to true for dark mode, false for light mode

    // Hide the graph
    const graphContainer = document.querySelector(`.${css.chartContainer}`);
    graphContainer.style.opacity = "0";
    graphContainer.style.transition = "opacity 0.3s";
    graphContainer.style.display = "none";

    // Generate the table data, removing rows with zero sales and expense values
    const filteredData = chartData.filter(
      (item) => item.sales !== 0 || item.expense !== 0
    );
    const tableData = filteredData.map((item) => ({
      Date: item.requestedDate,
      Sales: item.sales,
      Expense: item.expense,
    }));

    // Calculate totals
    const salesTotal = filteredData.reduce((total, item) => total + item.sales, 0);
    const expenseTotal = filteredData.reduce(
      (total, item) => total + item.expense,
      0
    );

    // Add totals row if there are non-zero values
    if (salesTotal !== 0 || expenseTotal !== 0) {
      tableData.push({
        Date: "Total",
        Sales: `₹${salesTotal.toFixed(2)}`,
        Expense: `₹${expenseTotal.toFixed(2)}`,
      });
    }

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
      <th colspan="3" class="${css.summaryHeader}">Sales-Expense Summary</th>
    `;
    tableHeader.appendChild(tableHeaderRow);

    // Add the period header
    const periodHeaderRow = document.createElement("tr");
    periodHeaderRow.innerHTML = `
      <th colspan="3" class="${css.periodHeader}">Period: ${startDate} to ${endDate}</th>
    `;
    tableHeader.appendChild(periodHeaderRow);

    const secondHeaderRow = document.createElement("tr");
    secondHeaderRow.innerHTML = `
      <th class="${css.headerCell}">Date</th>
      <th class="${css.headerCell}">Sales</th>
      <th class="${css.headerCell}">Expense</th>
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
      className={`${css.chartContainer} ${
        themeMode === "dark" ? css.darkMode : css.lightMode
      }`}
    >
      
      <Row className="text-left w-100">
        <Col className="d-flex justify-content-start align-items-center fs-2" >Sales-Expense</Col>
        <Col className="d-flex justify-content-end" ><div className={css.iconsContainer} ref={iconContainerRef}>
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
        </div></Col>
      </Row>
     
     
        
    
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
      <ReactECharts
        option={option}
        style={{
    
          height: "500px",
          width: "100%",
          maxWidth: "2300px",
        }}
        className={themeMode === "dark" ? css.darkMode : css.lightMode}
      />
    </div>
  );
};

export default StatisticsChart;
