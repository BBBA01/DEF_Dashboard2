import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTable,
  faFileExcel,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import css from './OrdersPieChart2.module.css';


const OrdersPieChart2 = ({ themeMode }) => {
  const [sellData, setSellData] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const iconContainerRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    axios
      .get(
        'http://115.124.120.251:5059/api/Dashboard/DEFDashBoardGraphData/2023-01-01/2023-06-01/46A1C7B7-6885-4F74-7ADE-08DAFE23C727/6'
      )
      .then((response) => {
        const data = response.data;
        const graph2Data = data.graph2;

        // Perform the desired operation on the fetched data
        const sell = graph2Data.reduce((result, item) => {
          const { lstproduct } = item;
          lstproduct.forEach((product) => {
            const { productName, totalSale } = product;
            if (result[productName]) {
              result[productName] += totalSale;
            } else {
              result[productName] = totalSale;
            }
          });
          return result;
        }, {});

        const sellData = Object.entries(sell).map(([productName, totalSale]) => ({
          productName,
          totalSale,
        }));

        setSellData(sellData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  
  const colors = [
    '#009AEE',
    '#FFD700',
    '#FF7F50',
    '#ADFF2F',
    '#40E0D0',
    '#FF00FF',
    '#FF1493',
    '#228B22',
    '#FF4500',
    '#4682B4',
    // Add more colors as needed
  ];

  const option = {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '<b>{b}</b><br><b>Total Sales:</b> ₹{c}',
    },
    legend: {
      orient: 'vertical',
      left: 'center',
      top: '700vh',
      itemGap: 20, // Adjust the itemGap to create a gap
      textStyle: {
        color: themeMode === 'dark' ? '#ffffff' : '#000000',
        fontSize: 14,
      },
      formatter: '{name}',
    },
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
      
        text: 'Product Wise',
        fill: themeMode === 'dark' ? '#ffffff' : '#000000',
        fontSize: 20,
        fontWeight: 'bold',
      },
    },
    series: [
      {
        name: 'Product Sales',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '50%'],
        selectedMode: 'single',
        data: sellData.map((item, index) => ({
          value: item.totalSale,
          name: item.productName,
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
        label: {
          show: true,
          textStyle: {
            fontSize: 16,
            
          },
          formatter: '{b}: {c}',
          color: themeMode === 'dark' ? '#ffffff' : '#000000', // Set text color to white
          borderWidth: 0,
          
        },
        labelLine: {
          length: 30,
          length2: 10,
        },
      },
    ],
  };

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
  
    // Fetch the image file (replace "logo.png" with the correct path/URL)
    fetch("logo.png")
      .then((response) => response.blob())
      .then((blob) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          const imageBase64 = fileReader.result;
  
          // Add the image to the worksheet
          const logoImage = workbook.addImage({
            base64: imageBase64,
            extension: "png",
          });
  
          // Set the image position and size with padding
          worksheet.addImage(logoImage, {
            tl: { col: 0, row: 0 }, // Adjusted offset values for padding
            ext: { width: 25, height: 25 },
          });
  
          // Continue with the rest of the function
  
          const extraHeaderCell = worksheet.getCell("A1");
          extraHeaderCell.value = "Sales-Expense Summary";
          extraHeaderCell.font = {
            bold: true,
            color: { argb: "000000" }, // Black color
            size: 14,
          };
          extraHeaderCell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
          worksheet.mergeCells("A1:B1");
  
          // Set column widths
          worksheet.getColumn(1).width = 25;
          worksheet.getColumn(2).width = 15;
  
          // Add headers
          const headerRow = worksheet.addRow(["Product Name", "Total Sale"]);
          headerRow.font = {
            bold: true,
            color: { argb: "000000" }, // Black color
            size: 12,
          };
  
          // Apply underline and border style to each cell
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
  
          // Add data rows
          sellData.forEach((item) => {
            worksheet.addRow([item.productName, `₹${item.totalSale}`]); // Add "₹" symbol before the totalSale value
          });
  
          // Generate a unique filename
          const fileName = `export_${Date.now()}.xlsx`;
  
          // Save the workbook
          workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer]), fileName);
          });
        };
  
        fileReader.readAsDataURL(blob);
      });
  };
  
  

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Set table headers
    const headers = [['Product Name', 'Total Sale']];



    const headerStyles = {
      fontSize: 12,
      fontStyle: "bold",
      halign: "center",
    };
  
    // Set background colors
    const backgroundColors = {
      summaryHeader: "#3CB043", // Green color for Sales-Expense Summary header
      secondHeader: "#75AAF0", // Sky blue color for Date, Expense, Sales header
    };

     // Add the image
     const imgData = "logo.png"; // Replace with the path or URL of your image file
     const imgWidth = 20;
     const imgHeight = 20;
     doc.addImage(imgData, "PNG", 15, 5, imgWidth, imgHeight);
  
    // Add Sales-Expense Summary header
    const summaryHeader = [["Sales-Expense Summary"]];
    doc.autoTable({
      head: summaryHeader,
      body: [],
      headStyles: {
        ...headerStyles,
        fillColor: backgroundColors.summaryHeader,
        textColor: "#FFFFFF", // White color
      },
      margin: { top: 30}, // Move it a little down
    });

   

    // Set table rows
    const rows = sellData.map((item) => [
      item.productName,
      item.totalSale,
    ]);

    // AutoTable configuration
    const tableConfig = {
      startY: doc.autoTable.previous.finalY + 1,
      head: headers,
      body: rows,
      headStyles: {
        ...headerStyles,
        fillColor: backgroundColors.secondHeader,
        textColor: "#FFFFFF", // White color
      },
    };

    // Add table to the PDF document
    doc.autoTable(tableConfig);

    // Generate a unique filename
    const fileName = `export_${Date.now()}.pdf`;

    // Save the PDF document
    doc.save(fileName);
  };

  const exportToTable = () => {
    // Hide the graph
    const graphContainer = document.querySelector(`.${css.chartContainer}`);
    graphContainer.style.opacity = "0";
    graphContainer.style.transition = "opacity 0.3s";
    graphContainer.style.display = "none";
  
    // Generate the table data (replace sellData with your actual data)
    const tableData = sellData.map((item) => ({
      "Product Name": item.productName,
      "Total Sale": item.totalSale,
    }));
  
    // Create a new element to hold the table
    const tableContainer = document.createElement("div");
    tableContainer.className = css.tableContainer;
    tableContainer.style.opacity = "0";
    tableContainer.style.transition = "opacity 0.3s";
  
    // Create the table element
    const table = document.createElement("table");
    table.className = css.table;
  
    // Create the table header
    const tableHeader = document.createElement("thead");
    const tableHeaderRow = document.createElement("tr");
    tableHeaderRow.innerHTML = `
      <th class="${css.headerCell}">Product Name</th>
      <th class="${css.headerCell}">Total Sale</th>
    `;
    tableHeader.appendChild(tableHeaderRow);
  
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
        graphContainer.style.opacity = "0";
        graphContainer.style.transition = "opacity 0.3s";
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
    graphContainer.parentNode.insertBefore(tableWrapper, graphContainer.nextSibling);
  
    // Show the table with a smooth animation
    setTimeout(() => {
      tableContainer.style.opacity = "1";
    }, 10);
  };
  
  
  
  
  useEffect(() => {
    function handleClick(event) {
      // Check if the click target or any of its parents match the iconContainer or iconRef
      if (
        (iconContainerRef.current && iconContainerRef.current.contains(event.target)) ||
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

  return (
    <div
      className={`${css.chartContainer} ${
        themeMode === 'dark' ? css.darkMode : css.lightMode
      }`}
    >
      {sellData.length > 0 ? (
        <>
          <div className={css.iconsContainer} ref={iconContainerRef}>
            {/* Data grid icon */}
            <div
              className={`${css.icon} ${
                themeMode === 'dark' ? css.darkMode : css.lightMode
              }`}
              ref={iconRef}
              onClick={handleIconClick}
            >
              <FontAwesomeIcon icon={faTable} size="lg" />
            </div>
            {showExportOptions && (
              <div
                className={`${css.exportOptions} ${
                  themeMode === 'dark' ? css.darkMode : css.lightMode
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
         
          <ReactECharts
    option={option}
    style={{ top: '60px', width: "100%"}}
    className={themeMode === "dark" ? css.darkMode : css.lightMode}
  />
 
        </>
      ) : (
        <div>Loading data...</div>
      )}
    </div>
   
  );
};

export default OrdersPieChart2;
