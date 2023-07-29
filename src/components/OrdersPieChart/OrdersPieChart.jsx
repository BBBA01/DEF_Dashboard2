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
  faList,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import css from './OrdersPieChart.module.css';
import logo from "../../logo.png";
import codeBlockIcon from "../../code-block.png";




const OrdersPieChart = ({
  themeMode,
  selectedRange,
  selectedOffice,
  isAdmin,
}) => {
  const [sellData, setSellData] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const iconContainerRef = useRef(null);
  const exportOptionsRef = useRef(null);
  const iconRef = useRef(null);
  const [showLegend, setShowLegend] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Function to update the window width state on window resize
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add a window resize event listener
    window.addEventListener("resize", handleWindowResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);

    axios
      .get(
        `http://115.124.120.251:5064/api/v1/dashboard/sales_list/${startDate}/${endDate}/${selectedOffice}/${isAdmin}`
      )
      .then((response) => {
        const data = response.data;
        const graph2Data = data.graph2;

        let result = {}
        let colorlist = {}
        let qtylist={}
        let unitname={}
        graph2Data.forEach((item) => {
          const { lstproduct } = item;

          lstproduct.forEach((product) => {
            let { productName, totalSales, color,qty,unitShortName } = product;
            if (totalSales !== 0) {
              if (result[productName]) {
                result[productName] += totalSales;
                qtylist[productName] +=qty
              } else {
                result[productName] = totalSales;
                colorlist[productName] = color
                qtylist[productName] =qty
                unitname[productName] =unitShortName

              }
            }
          }
          )

        }
        )
    
        if (result) {
          let temp = []
          for (let key in result) {
            temp.push({"productName":key,"totalSale":result[key],"color":colorlist[key],"totalQty":qtylist[key],"unit":unitname[key]})
          }
          setSellData(temp)
        }

       
      })
      .catch((error) => {
        // setSellData([])
        // console.error("Error fetching data:", error);
      });
      if(document.querySelector(`.${css.closeButton}`)){
        document.querySelector(`.${css.closeButton}`).click()
      }

  }, [selectedRange, selectedOffice, isAdmin]);

  const toggleLegend = () => {
    if (sellData.length > 0)
      setShowLegend(!showLegend); // Toggle the state for showLegend
    // Toggle the state for showScrollbar
  };

  // const colors = [
  //   "#009AEE",
  //   "#FFD700",
  //   "#FF7F50",
  //   "#ADFF2F",
  //   "#40E0D0",
  //   "#FF00FF",
  //   "#FF1493",
  //   "#228B22",
  //   "#FF4500",
  //   "#4682B4",
  //   // Add more colors as needed
  // ];

  const legendFormatter = (value) => {
    // Custom logic to make labels shorter, e.g., show only the first 5 characters
    return windowWidth <= 1000 && value.length > 7
      ? value.substring(0, 7) + "..."
      : value;
  };


  const option = {

    tooltip: {
      trigger: "item",
      formatter: "<b>{b}</b><br><b>Total Sales:</b> ₹{c}",
      textStyle: {
        fontSize: windowWidth <= 768 ? 10 : 14,
      },
    },
    legend: {
      orient: "vertical",
      backgroundColor: themeMode === "dark" ? "#111111df" : "rgb(249 249 249 / 97%)",
      // shadowBlur: 2,
      left: "5px",
      top: "10%",
      borderRadius: 10,
      padding: 10,
      show: showLegend,
      shadowColor: "#ececec",
      borderColor: "rgba(57, 50, 50, 0.7)",
      borderWidth: 1,

      itemGap: 10, // Adjust the itemGap to create a gap
      textStyle: {
        color: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: window.innerWidth <= 1496 ? 12 : 14,
        padding: 4
      },

      type: "scroll", // Set the type of scrollbar (can be 'scroll' or 'slider')
      // You can also adjust other scrollbar properties here if needed
      scroll: {
        show: true,
        orient: "horizontal", // Scroll orientation (can be 'vertical' or 'horizontal')
      },
    },

    graphic: {
      type: "text",
      left: "center",
      top: "top",
      style: {
        text: "Product Volume",
        fill: themeMode === "dark" ? "#ffffff" : "#000000",
        fontSize: windowWidth <= 1496 ? 16 : 18,
        fontWeight: "bold",

      },
    },
    series: [
      {
        name: "Product Sales",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "50%"],
        selectedMode: "single",
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 9,
            fontWeight: "bold",

          }
        },
        data: sellData.length > 0 ? sellData.map((item, index) => ({
          value: item.totalSale,
          name: item.productName,
          itemStyle: {
            color: item.color,
          },
        })) : [],


        labelLine: {
          length: 30,
          length2: 10,
        },
        itemStyle: {
          borderWidth: 2, // Set the border width
          borderColor: '#ffffff00',
          borderRadius:4 // Set the border color
        },
      },
    ],
  };

  const exportToExcel = () => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Fetch the image file (replace "logo.png" with the correct path/URL)
    fetch(logo)
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
            ext: { width: 100, height: 56 },
          });

          // Continue with the rest of the function

          const extraHeaderCell = worksheet.getCell("A2"); // Shifted down by one row
          extraHeaderCell.value = "Product Wise Summary Data";
          extraHeaderCell.font = {
            bold: true,
            color: { argb: "000000" }, // Black color
            size: 14,
          };
          extraHeaderCell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
          worksheet.mergeCells("A2:B2"); // Shifted down by one row

          // Set column widths
          worksheet.getColumn(1).width = 50;
          worksheet.getColumn(2).width = 15;

          // Add headers
          const headerRow = worksheet.addRow([
            "Product Name",
            "Quantity",
            "Total Sale",
          ]);

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
            worksheet.addRow([
              item.productName,
              `${item.totalQty} ${item.unit}`,
              `₹${item.totalSale}`,
            ]); // Add "₹" symbol before the totalSale value
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

  const formatDate = (date) => {
    if (!date) {
      return ""; // Return an empty string or a default date string
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const exportToPDF = () => {
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);

    const doc = new jsPDF();

    // Set table headers
    const headers = [["Product Name", "Quantity", "Total Sale"]];

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
    const imgData = logo; // Replace with the path or URL of your image file
    const imgWidth = 35;
    const imgHeight = 20;
    doc.addImage(imgData, "PNG", 15, 12, imgWidth, imgHeight);

    // Add Sales-Expense Summary header
    const summaryHeader = [["Product Wise Summary Data"]];
    doc.autoTable({
      head: summaryHeader,
      body: [],
      headStyles: {
        ...headerStyles,
        fillColor: backgroundColors.summaryHeader,
        textColor: "#FFFFFF", // White color
      },
      margin: { top: 30 }, // Move it a little down
    });

    // Set table rows
    const rows = sellData.map((item) => [
      item.productName,
      `${item.totalQty} ${item.unit}`,
      item.totalSale.toFixed(2),
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
    const startDate = formatDate(selectedRange[0]);
    const endDate = formatDate(selectedRange[1]);

    // Hide the graph
    const graphContainer = document.querySelector(`.${css.chartContainer}`);
    graphContainer.style.opacity = "0";
    graphContainer.style.transition = "opacity 0.3s";
    graphContainer.style.display = "none";

    // Generate the table data (replace sellData with your actual data)
    const tableData = sellData.map((item) => ({
      "Product Name": item.productName,
      Quantity: `${item.totalQty} ${item.unit}`,
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
      <th colspan="3" class="${css.summaryHeader}">Product Wise Summary Data</th>
    `;
    tableHeader.appendChild(tableHeaderRow);

    // Create the second row for the column headers
    const columnHeaderRow = document.createElement("tr");
    columnHeaderRow.innerHTML = `
      <th class="${css.headerCell}">Product Name</th>
      <th class="${css.headerCell}">Quantity</th>
      <th class="${css.headerCell}">Total Sale</th>
    `;
    tableHeader.appendChild(columnHeaderRow);

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

  return (
    <>
      <div
        className={`${css.chartContainer} ${themeMode === "dark" ? css.darkMode : css.lightMode
          }`}
      >

        <>

          <div className={`${css.iconsContainer} d-flex justify-content-center align-items-center`} ref={iconContainerRef}>
            {/* Data grid icon */}
            <div
              className={`${css.icon} ${themeMode === "dark" ? css.darkMode : css.lightMode
                }`}
              ref={iconRef}
              onClick={handleIconClick}
            >
              {showExportOptions ? <FontAwesomeIcon icon={faXmark} size="lg" /> : <FontAwesomeIcon icon={faList} size="lg" />}
            </div>
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
                <div className={css.exportOption} onClick={exportToTable}>
                  <FontAwesomeIcon icon={faTable} size="lg" />
                  <span>Export to Table</span>
                </div>
              </div>
            )}
          </div>

          {" "}
          {/* Add a container for the legend button */}
          <button
            className={css.legendButton}
            onClick={toggleLegend} // Call the toggleLegend function when the button is clicked
          >
            <img
              src="http://115.124.120.251:5007/images/code-block.png"
              alt="Code Block Icon"
              className={css.codeBlockIcon}
              title="Legends"
            />{" "}
            {/* Display different text based on the showLegend state */}
          </button>


          <ReactECharts
            key={sellData.length}
            option={option}
            style={{
              marginTop: window.innerWidth <= 1496 ? "-8%" : "-6%",
              height: "291px",
              width: "100%",
              maxWidth: "2300px",
            }}
            className={css.piechart}
          // className={themeMode === "dark" ? css.darkMode : css.lightMode}
          />
        </>

      </div>
    </>
  );
};

export default OrdersPieChart;
