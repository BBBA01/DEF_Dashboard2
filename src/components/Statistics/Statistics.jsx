import css from './Statistics.module.css';
import { BsArrowUpShort } from 'react-icons/bs';
import StatisticsChart from '../StatisticsChart/StatisticsChart';
import StatisticsChart2 from '../StatisticsChart2/StatisticsChart2';
import StatisticsChart3 from '../StatisticsChart3/StatisticsChart3';
import StatisticsChart4 from '../StatisticsChart4/StatisticsChart4';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrdersPieChart from '../OrdersPieChart/OrdersPieChart';
import officeData from "../../data/officeData.json";

import { DateRangePicker } from 'rsuite';

const Statistics = ({ themeMode }) => {
  const [selectedChart, setSelectedChart] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRange, setSelectedRange] = useState([new Date('2023-01-01'), new Date('2023-06-01')]);

  const [maxPrice, setMaxPrice] = useState(0);
  const [maxProfit, setMaxProfit] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [isAdmin, setIsAdmin] = useState("");


  useEffect(() => {
    // Trigger the first option in the officefilter
    const firstOption = document.querySelector('#office option:first-child');
    if (firstOption) {
      const isRetail = firstOption.getAttribute('data-isretail');
      const isAdmin = firstOption.getAttribute('data-isadmin');
      setSelectedOffice(firstOption.value);
      setIsAdmin(isAdmin);
      // Render chart data or perform any other actions based on the selected office
    }
  }, []);

 

  // useEffect(() => {
  //   axios
  //     .get('http://localhost:3000/orders') // Replace with the URL of your orders API
  //     .then(response => {
  //       const orderData = response.data;

  //       // Calculate max profit
  //       let maxProfit = 0;
  //       for (const order of orderData) {
  //         const profit = order.Sales - order.Quantity_Ordered * order.Price_Each;
  //         if (profit > maxProfit) {
  //           maxProfit = profit;
  //         }
  //       }

  //       setMaxProfit(parseFloat(maxProfit).toFixed(2));

  //       // Calculate daily average
  //       const totalSales = orderData.reduce((sum, order) => sum + order.Sales, 0);
  //       const days = new Set(orderData.map(order => order.Order_Date)).size;
  //       const average = totalSales / days;
  //       setDailyAverage(average.toFixed(2));
  //     })
  //     .catch(error => {
  //       console.error('Error fetching order data:', error);
  //     });
  // }, []);

  const handleChartSelection = event => {
    const selectedValue = event.target.value;
    setSelectedChart(selectedValue);
    navigate(selectedValue);
  };

  const handleDateRange = (value) => {
    if (value == null) {
      setSelectedRange([null, null]); // Clear the dateRange value
    } else {
      setSelectedRange(value);
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


  const handleOfficeChange = (event) => {
    const selectedOption = event.target.selectedOptions[0];
    const isRetail = selectedOption.getAttribute("data-isretail");
    const isAdmin = selectedOption.getAttribute("data-isadmin");

    setSelectedOffice(event.target.value);
    setIsAdmin(isAdmin);
    console.log(selectedOption);

    console.log(selectedOffice, isAdmin);

   


  };

  //fetching company, wholesale pumps, retail pumps data from officeData.json

  const companies = officeData.filter(
    (office) => office.OfficeTypeName === "Company"
  );
  const wholesales = officeData.filter(
    (office) => office.OfficeTypeName === "Wholesale Pumps"
  );
  const retails = officeData.filter(
    (office) => office.OfficeTypeName === "Retail Pumps"
  );


  

  return (
    <div className={`${css.container} ${themeMode === 'dark' ? 'theme-container' : 'theme2-container'}`}>
      <span className={css.title}><h4>Overview Statistics</h4></span>
      <div className={`${css.topContainer} ${
        themeMode === "dark" ? css.darkMode : css.lightMode
      }`}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
              marginRight: "7px",
            }}
            className={`${css.dateFilter} ${
              themeMode === "dark" ? css.darkMode : css.lightMode
            }`}
          >
             <label>Date Range:</label> 
            <DateRangePicker
              style={{ width: 230, color: 'black' }}
              value={selectedRange}
              onChange={handleDateRange}
              appearance="subtle"
              className="date-range-picker"
            /> 
          </div>
          <div
            style={{}}
            className={`${css.officefilter} ${
              themeMode === "dark" ? css.darkMode : css.lightMode
            }`}
          >
            <label htmlFor="office">Office:</label>
            <div>
              <select
                name="office"
                id="office"
                className="form-control"
               
                onChange={handleOfficeChange}
              >
        
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="-1"
                  data-isadmin="6"
                  className={`${css.boldOption}`}
                  selected={isAdmin === "6"}
                >
                  All Entities
                </option>
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="0"
                  data-isadmin="4"
                  className={`${css.boldOption}`}
                  selected={isAdmin === "4"}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;All Companies
                </option>
                {companies.map((company) => (
                  <option
                    key={company.OfficeId}
                    value={company.OfficeId}
                    data-isretail={company.OfficeTypeId === 2 ? "1" : "0"}
                    data-isadmin="5"
                    className={`${css.optionGroup}`}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {company.OfficeName}
                  </option>
                ))}
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="-1"
                  data-isadmin="1"
                  className={`${css.boldOption}`}
                  selected={isAdmin === "1"}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;All Pumps
                </option>
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="0"
                  data-isadmin="3"
                  className={`${css.boldOption}`}
                  selected={isAdmin === "3"}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wholesale
                  Pumps
                </option>
                {wholesales.map((wholesalep) => (
                  <option
                    key={wholesalep.OfficeId}
                    value={wholesalep.OfficeId}
                    data-isretail={wholesalep.OfficeTypeId === 2 ? "1" : "0"}
                    data-isadmin="0"
                    className={`${css.optionGroup}`}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {wholesalep.OfficeName}
                  </option>
                ))}
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="1"
                  data-isadmin="2"
                  className={`${css.boldOption}`}
                  selected={isAdmin === "2"}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Retail Pumps
                </option>
                {retails.map((retailp) => (
                  <option
                    key={retailp.OfficeId}
                    value={retailp.OfficeId}
                    data-isretail={retailp.OfficeTypeId === 2 ? "1" : "0"}
                    data-isadmin="0"
                    className={`${css.optionGroup}`}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {retailp.OfficeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      {/* <div className={`${css.cards} ${themeMode === 'dark' ? 'grey-container' : 'silver-container'}`}> */}
        {/* <div>
          <div className={css.arrowIcon}>
            <BsArrowUpShort style={{ color: themeMode === 'dark' ? 'black' : 'white' }} />
          </div>

          <div className={css.card}>
            <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Top Product this month</span>
            <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Office comps</span>
          </div>
        </div> */}

        {/* <div className={css.card}>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Max Product Price</span>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>₹1700</span>
        </div>

        <div className={css.card}>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Max Profit</span>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>₹{maxProfit}</span>
        </div>

        <div className={css.card}>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Daily Average</span>
          <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>₹{dailyAverage}</span>
        </div> */}
      {/* </div> */}

      {/* <div className={css.durationButton}>
        <select value={selectedChart} onChange={handleChartSelection}>
          <option value="">Select an option</option>
          <option value="/">What is best Month for Sales?</option>
          <option value="/chart2">Which City Sold Most Products?</option>
          <option value="/chart3">Which Time to Sell Products?</option>
          <option value="/chart4">Cross Sell of Products</option>
          <option value="/chart5">Which Product Sold the Most?</option>
          <option value="/chart6">Why that Product Sold the Most?</option>
          <option value="/chart7">Average Purchase Value</option>
        </select>
      </div> */}
       
       <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center',flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
      <StatisticsChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} />
      <OrdersPieChart selectedRange={selectedRange} themeMode={themeMode}/>
       </div>
      <StatisticsChart2 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart3 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart4 selectedRange={selectedRange} themeMode={themeMode} />
      
    </div>
  );
};

export default Statistics;
