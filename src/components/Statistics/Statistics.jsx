import css from './Statistics.module.css';
import StatisticsChart from '../StatisticsChart/StatisticsChart';
// import StatisticsChart2 from '../StatisticsChart2/StatisticsChart2';
// import StatisticsChart3 from '../StatisticsChart3/StatisticsChart3';
// import StatisticsChart4 from '../StatisticsChart4/StatisticsChart4';
import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrdersPieChart from '../OrdersPieChart/OrdersPieChart';
import { DateRangePicker } from 'rsuite';
import { subDays, toDate } from 'date-fns';
// import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCalendar, faCalendarDays, faCoins, faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';
import './Statistics.module.css'
import ProductQtyChart from '../ProductQtyChart/ProductQtyChart';



const Statistics = ({ themeMode, officeId, adminStatus }) => {
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
  const [selectedOffice, setSelectedOffice] = useState(officeId);
  const [isAdmin, setIsAdmin] = useState(adminStatus);
  const initialuserId = urlParams.get('userId');
  const [userId, setUserId] = useState(initialuserId);
  const [companies, setCompanies] = useState([])
  const [wholesales, setWholesales] = useState([])
  const [retails, setRetails] = useState([])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [filterOn, setFilterOn] = useState(false)

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // useEffect(() => {
  // Trigger the first option in the officefilter
  // const firstOption = document.querySelector('#office option:first-child');
  // if (firstOption) {
  //   const isRetail = firstOption.getAttribute('data-isretail');
  //   const isAdmin = firstOption.getAttribute('data-isadmin');
  // setSelectedOffice(officeId);
  // setIsAdmin(6);
  // Render chart data or perform any other actions based on the selected office
  // }
  // }, []);


  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://115.124.120.251:5064/api/v1/dashboard/dropdown_list/${userId}`);
        const officeDataFromApi = await response.data;

        // Update the state with the fetched data
        // Assuming the API response contains an array of office objects
        // with properties: OfficeId, OfficeName, OfficeTypeName, OfficeTypeId

        setOfficeData(officeDataFromApi); // You should define the state for officeData

        setCompanies(officeDataFromApi.filter(
          (office) => office.OfficeTypeName === "Company"
        ));
        setWholesales(officeDataFromApi.filter(
          (office) => office.OfficeTypeName === "Wholesale Pumps"
        ));
        setRetails(officeDataFromApi.filter(
          (office) => office.OfficeTypeName === "Retail Pumps"
        ));
        //console.log(officeDataFromApi);
        // console.log(officeDataFromApi.filter(
        //   (office) => office.OfficeTypeName === "Company"
        // ));
        //console.log(officeDataFromApi.filter(
        //(office) => office.OfficeTypeName === "Wholesale Pumps"
        //));
        //console.log(officeDataFromApi.filter(
        //(office) => office.OfficeTypeName === "Retail Pumps"
        //));
        //console.log(officeDataFromApi.filter(
        //(office) => office.OfficeTypeName === "Company"
        //));
        if(document.querySelector(`.${css.closeButton}`)){
          document.querySelector(`.${css.closeButton}`).click()
        }

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

  // const companies = officeData.filter(
  //   (office) => office.OfficeTypeName === "Company"
  // );
  // const wholesales = officeData.filter(
  //   (office) => office.OfficeTypeName === "Wholesale Pumps"
  // );
  // const retails = officeData.filter(
  //   (office) => office.OfficeTypeName === "Retail Pumps"
  // );




  return (

    <div className={`${css.container} ${themeMode === 'dark' ? 'theme-container' : 'theme2-container'} pb-5`}>
      <div className='d-flex justify-content-between align-items-center mb-0'>
        <div className='fs-2 mx-sm-0 mx-md-4 fw-bold'><span className='mx-2 text-primary'><FontAwesomeIcon icon={faCoins} /></span> Sales Overview</div>
        <button className="btn btn-primary btn-lg mx-2" type="submit" onClick={() => setFilterOn(!filterOn)}><span className='me-1'>{filterOn ? <FontAwesomeIcon icon={faXmark} size='lg' /> : <FontAwesomeIcon icon={faFilter} size='sm' />}</span>  {windowWidth > 500 ? filterOn ? 'Close' : `Filter` : ""}</button>
      </div>
      <div style={{ visibility: filterOn ? 'visible' : 'hidden', opacity: filterOn ? 1 : 0, height: filterOn ? windowWidth >= 768 ?"85px":"130px" : 0, marginBottom: filterOn ? "10px" : 0 }} className={`${css.topContainer} ${themeMode === "dark" ? css.darkMode : css.lightMode
        }`}>
      

        <div className="row d-flex justify-content-start flex-wrap align-items-center mx-0 mx-sm-2 mx-md-0 w-100" style={{width:"100% !important"}}>
          <div className="col-md-6 col-lg-5 my-sm-2   my-2 d-flex justify-content-center align-items-center pw-md-0 mx-0 mx-lg-3">
          {windowWidth>400?<div className="me-2 mx-sm-3"><FontAwesomeIcon icon={faCalendarDays} style={{fontSize:'2.3rem',color:"white"}}/></div>:''}
            <DateRangePicker
              size="lg"
              showOneCalendar
              style={{ color: 'black',width:"100%" }}

              value={selectedRange}
              onChange={handleDateRange}
              appearance="default"
              className={`${css.dateRangePicker}`}
            />
          </div>
          <div className="col-md-5 col-lg-5 my-sm-2   my-2 d-flex justify-content-center align-items-center mx-0 mx-lg-3">
            {windowWidth>400?<div className="me-2 mx-sm-3 mt-1"><FontAwesomeIcon icon={faBuilding} style={{fontSize:'2.3rem',color:"white"}}/></div>:''}
            <select className="form-select form-select-lg" aria-label="Default select example" id="office" onChange={handleOfficeChange} style={{ paddingBottom: "4px !important", paddingTop: "4px !important" }}>
              {companies.length > 1 ? <><option
                value={officeId}
                data-isretail="-1"
                data-isadmin="6"
                className={`${css.boldOption}`}

              >
                All Entities
                
              </option> </>: ''}
              {companies.length > 0 ? <><option
                value={officeId}
                data-isretail="0"
                data-isadmin="4"
                className={`${css.boldOption}`}

              >
                &nbsp;&nbsp;All Companies
              </option></> : ''}

              {companies.map((company) => (
                <option
                  key={company.OfficeId}
                  value={company.OfficeId}
                  data-isretail={company.OfficeTypeId === 2 ? "1" : "0"}
                  data-isadmin="5"
                  className={`${css.optionGroup}`}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {company.OfficeName}
                </option>
              ))}

              {wholesales.length > 1 || retails.length > 1 ?<> <option
                value={officeId}
                data-isretail="-1"
                data-isadmin="1"
                className={`${css.boldOption}`}

              >
                &nbsp;&nbsp;All Pumps
              </option></> : ''}
              {wholesales.length > 0 && companies.length > 0 ? <><option
                value={officeId}
                data-isretail="0"
                data-isadmin="3"
                className={`${css.boldOption}`}

              >
                &nbsp;&nbsp;&nbsp;Wholesale
                Pumps
              </option></>: ''}
              {wholesales.map((wholesalep) => (
                <option
                  key={wholesalep.OfficeId}
                  value={wholesalep.OfficeId}
                  data-isretail={wholesalep.OfficeTypeId === 2 ? "1" : "0"}
                  data-isadmin="0"
                  className={`${css.optionGroup}`}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {wholesalep.OfficeName}
                </option>
              ))}
              {(retails.length > 0 && companies.length > 0 ) ? <option
                value={officeId}
                data-isretail="1"
                data-isadmin="2"
                className={`${css.boldOption}`}

              >
                &nbsp;&nbsp;&nbsp;Retail Pumps
              </option>: ''}
              
              {(retails.length > 0 && companies.length >0 )?retails.map((retailp) => (
                <option
                  key={retailp.OfficeId}
                  value={retailp.OfficeId}
                  data-isretail={retailp.OfficeTypeId === 2 ? "1" : "0"}
                  data-isadmin="0"
                  className={`${css.optionGroup}`}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {retailp.OfficeName}
                </option>
              )):retails.map((retailp) => (
                <option
                  key={retailp.OfficeId}
                  value={retailp.OfficeId}
                  data-isretail={retailp.OfficeTypeId === 2 ? "1" : "0"}
                  data-isadmin="0"
                  className={`${css.optionGroup}`}
                >
                 
                  {retailp.OfficeName}
                </option>
              ))}
            </select>
          </div>
       
        </div>
      </div>

      <div className={`${windowWidth>550?"container-fluid":""}`}>
        {selectedOffice.length > 0 ? <Row>
          <Col md={12} lg={8} ><StatisticsChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} /></Col>
          <Col md={12} lg={4} ><OrdersPieChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} /></Col>
          <Col md={12} lg={4} className='mt-3'><ProductQtyChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} /></Col>
        </Row> : ''}
      </div>

      {/* <StatisticsChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin} />
      <OrdersPieChart selectedRange={selectedRange} themeMode={themeMode} selectedOffice={selectedOffice} isAdmin={isAdmin}/> */}



      {/* <StatisticsChart2 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart3 selectedRange={selectedRange} themeMode={themeMode} />
      <StatisticsChart4 selectedRange={selectedRange} themeMode={themeMode} /> */}

    </div>

  );
};

export default Statistics;
