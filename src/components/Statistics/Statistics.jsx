import css from './Statistics.module.css';
import { BsArrowUpShort } from 'react-icons/bs';
import StatisticsChart from '../StatisticsChart/StatisticsChart';
import StatisticsChart2 from '../StatisticsChart2/StatisticsChart2';
import StatisticsChart3 from '../StatisticsChart3/StatisticsChart3';
import StatisticsChart4 from '../StatisticsChart4/StatisticsChart4';
import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrdersPieChart from '../OrdersPieChart/OrdersPieChart';
import {  DateRangePicker } from 'rsuite';
import { subDays, toDate } from 'date-fns';
import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";






const Statistics = ({ themeMode }) => {
  const [selectedChart, setSelectedChart] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const [selectedRange, setSelectedRange] = useState([
    toDate(subDays(new Date(), 6)),
    toDate(new Date())
  ]);
  
  const [officeData, setOfficeData] = useState([]); // State to hold the fetched office data
  const [maxPrice, setMaxPrice] = useState(0);
  const [maxProfit, setMaxProfit] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const initialuserId = urlParams.get('userId');
  const [userId, setUserId] = useState(initialuserId);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


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


  useEffect(() => {
  
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/v1/dashboard/dropdown_list/${userId}`);
        const officeDataFromApi = response.data;

        // Update the state with the fetched data
        // Assuming the API response contains an array of office objects
        // with properties: OfficeId, OfficeName, OfficeTypeName, OfficeTypeId
        console.log(officeDataFromApi);
        setOfficeData(officeDataFromApi); // You should define the state for officeData
      } catch (error) {
        console.error('Error fetching office data:', error);
      }
    };

    fetchData();

}, [userId]);

 


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
      <span className={css.title}>Overview Statistics</span>
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
              style={{ color: 'black', }}

              value={selectedRange}
              onChange={handleDateRange}
              appearance="default"
              className={`${css.dateRangePicker}`}
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
              <Form.Select 
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
                  
                >
                  All Entities
                </option>
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="0"
                  data-isadmin="4"
                  className={`${css.boldOption}`}
                  
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
                  
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;All Pumps
                </option>
                <option
                  value="d5355d33-02cf-40b0-5246-08da286d7f4a"
                  data-isretail="0"
                  data-isadmin="3"
                  className={`${css.boldOption}`}
                  
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
              </Form.Select>
            </div>
          </div>
        </div>
       
      
      
         <StatisticsChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} />
          <OrdersPieChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin}/>
      
      
      
      
    
      {/* <StatisticsChart2 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart3 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart4 selectedRange={selectedRange} themeMode={themeMode} /> */}
      
    </div>
  
  );
};

export default Statistics;
