import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {  FaUser, FaBuilding, FaMoneyBill, FaMoneyBillAlt, FaSun, FaMoon } from 'react-icons/fa';
import Switch from 'react-switch';
import Statistics from '../../components/Statistics/Statistics';
import Orders from '../../components/Orders/Orders';
import css from './Dashboard.module.css';

const Dashboard = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialThemeMode = urlParams.get('theme') || 'light'; // Read theme mode from URL parameter
  const initialuserId = urlParams.get('userId');

  const [userCount, setUserCount] = useState(0);
  const [officeCount, setOfficeCount] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [userId, setUserId] = useState(initialuserId);
  const [officeId, setOfficeId] = useState();
  const [roleName, setRoleName] = useState('');
  const [officeName, setOfficeName] = useState('');
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

  

  const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTk4OGU3ZS1lODVhLTRjOTQtMGY1Zi0wOGQ4ZjFmMWI3OTkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiU0FkbWluIiwianRpIjoiYjUwODU3OWEtMzg1OS00ZTlhLTg0MTgtM2Q3ZDZkNTMxYzYxIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI1ZTk4OGU3ZS1lODVhLTRjOTQtMGY1Zi0wOGQ4ZjFmMWI3OTkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBlckFkbWluIiwiZXhwIjoxNzE5NTc4MTEzLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMxODcxIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMTg3MSJ9.v3VG1otpCu71imrgb_mVrGkQmVduWNHu28HuikQcp2A';
  const apiKey = `http://115.124.120.251:5059/api/Auth/User/${userId}`;
  


 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
        };
    
        // Fetch user data to get the officeId, roleName, and officeName
        const response = await axios.get(apiKey, { headers });
        const userData = response.data;
    
        const officeId = userData.officeId;
        const roleName = userData.roleName;
        const officeName = userData.officeName;

        setRoleName(roleName);
        setOfficeName(officeName);
        
        // Use the officeId to construct the second API endpoint
        const apiUrl2 = `http://115.124.120.251:5059/api/Dashboard/AdminDashboradData/${officeId}/1`;
    
        // Fetch data from the second API endpoint
        const response2 = await axios.get(apiUrl2, { headers });
        const data2 = response2.data;
    
        // Extract the required values from the response data based on roleName and officeName
        let userCount = 0;
        let officeCount = 0;
    
        if (roleName === 'CompanyAdmin') {
          const companyAdminData = data2.userCount.find(item => item.roleName === 'CompanyAdmin');
          if (companyAdminData) {
            userCount = companyAdminData.userCount;
          }
        } else if (roleName === 'PumpUser') {
          const pumpUserData = data2.userCount.find(item => item.roleName === 'PumpUser');
          if (pumpUserData) {
            userCount = pumpUserData.userCount;
          }
        }
    
        if (officeName.endsWith('Pump')) {
          const retailPumpsData = data2.officeCount.find(item => item.officeTypeName === 'Retail Pumps');
          if (retailPumpsData) {
            officeCount = retailPumpsData.officeCount;
          }
        } else {
          const companyData = data2.officeCount.find(item => item.officeTypeName === 'Company');
          if (companyData) {
            officeCount = companyData.officeCount;
          }
        }
    
        const income = data2.incomeDetails.total;
        const expense = data2.expenseDetails.total;
    
        // Update the state variables
        setUserCount(userCount);
        console.log(roleName);
        console.log(userCount);
        console.log(officeName);
        console.log(officeCount);
        setOfficeCount(officeCount);
        setIncome(income);
        setExpense(expense);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
        
  
    fetchData();
  }, []);
  
  

  const cardsData = [
    {
      title: 'User Count',
      amount: userCount,
      icons: [
        <FaUser size={20} />,
      ],
      backgroundColor: 'red',
    },
    {
      title: 'Office Count',
      amount: officeCount,
      icons: [
        <FaBuilding size={20} />,
      ],
      backgroundColor: 'blue',
    },
    {
      title: 'Sales',
      amount: income,
      icons: [
        <FaMoneyBill size={20} />,
      ],
      backgroundColor: 'green',
    },
    {
      title: 'Expense',
      amount: expense,
      icons: [
        <FaMoneyBillAlt size={20} />,
      ],
      backgroundColor: 'purple',
    },
  ];


  const handleThemeChange = (checked) => {
    const newThemeMode = checked ? 'dark' : 'light';
    setThemeMode(newThemeMode);

    // Update URL with the new theme mode and user ID parameters
    urlParams.set('theme', newThemeMode);
    urlParams.set('userId', userId);
    urlParams.set('jwtToken', jwtToken);

    const newUrl = `${location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };
  
  
  const renderSwitchIcon = () => {
    return themeMode === 'dark' ? (
      <FaSun className={css.switchIcon} size={25} />
    ) : (
      <FaMoon className={css.switchIcon} size={25} />
    );
  };

  return (
    <div className={`${css.container} ${themeMode === 'dark' ? css.darkMode : css.lightMode} ${css.scrollableContainer}`}>
      {/* left side */}
      <div className={`${css.dashboard} `}>
        <div
          className={`${css.dashboardHead} ${
            themeMode === 'dark' ? 'theme-container' : 'theme2-container'
          }`}
        >
          <div className={css.head}>
            <span>
              <b>Dashboard</b>
            </span>
            <Switch
              className={css.themeSwitch}
              checked={themeMode === 'dark'}
              onChange={handleThemeChange}
              checkedIcon={renderSwitchIcon()}
              uncheckedIcon={renderSwitchIcon()}
              offColor="#2f3542"
              onColor="#f1c40f"
              height={26}
              width={50}
              handleDiameter={24}
            />
          </div>
          <div className={`${css.cards} ${themeMode === 'dark' ? css.darkMode : css.lightMode}`}>
            <div className={css.card1}>
              <div className={css.cardHead}>
                <span>User Count</span>
                <span><FaUser size={50} /></span>
              </div>
              <div className={css.cardAmount}>
                <span>{roleName} :</span>
                <span>{userCount}</span>
              </div>
            </div>
            <div className={css.card2}>
              <div className={css.cardHead}>
                <span>Office Count</span>
                <span><FaBuilding size={50} /></span>
              </div>
              <div className={css.cardAmount}>
                <span>{officeName} :</span>
                
                <span>{officeCount}</span>
              </div>
            </div>
            <div className={css.card3}>
              <div className={css.cardHead}>
                <span>Sales</span>
                <span><FaMoneyBill size={50} /></span>
              </div>
              <div className={css.cardAmount}>
                <span>₹</span>
                <span>{income}</span>
              </div>
            </div>
            <div className={css.card4}>
              <div className={css.cardHead}>
                <span>Expense</span>
                <span><FaMoneyBillAlt size={50} /></span>
              </div>
              <div className={css.cardAmount}>
                <span>₹</span>
                <span>{expense}</span>
              </div>
            </div>
          </div>
        </div>
      
        <Statistics themeMode={themeMode} />
      {/* <Orders themeMode={themeMode} /> */}
    
      </div>
    </div>
  );
};

export default Dashboard;
