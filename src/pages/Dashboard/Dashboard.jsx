import React, { useEffect, useState } from "react";
import axios from "axios";
import 'react-loading-skeleton/dist/skeleton.css'
// import Lottie from "lottie-react";
// import { useLocation } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaMoneyBill,
  FaMoneyBillAlt,
  FaSun,
  FaMoon,
  FaArrowUp,
} from "react-icons/fa";
// import Switch from "react-switch";
import Statistics from "../../components/Statistics/Statistics";
import css from "./Dashboard.module.css";
// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import loader from "../../assets/loader/loader.json"
import { Suspense } from "react";
import Skeleton from '@mui/material/Skeleton';

const UserCard = React.lazy(() => import("./UserCard"));
const OfficeCard = React.lazy(() => import("./OfficeCard"));
const SalesCard = React.lazy(() => import("./SalesCard"));
const ExpenseCard = React.lazy(() => import("./ExpenseCard"));

const Dashboard = () => {
  // const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const initialThemeMode = urlParams.get("theme") || "light"; // Read theme mode from URL parameter
  const initialuserId = urlParams.get("userId");
  if (initialThemeMode == "light") {
    //change css variable --rs-body
    document.documentElement.style.setProperty("--rs-body", "rgb(210 210 210)");
    document.documentElement.style.setProperty("--text-color", "#111111");
    document.documentElement.style.setProperty("--option-color", "white");
  }
  else {
    document.documentElement.style.setProperty("--rs-body", "#111111");
    document.documentElement.style.setProperty("--text-color", "white");
    document.documentElement.style.setProperty("--option-color", "#111111");
  }

  const [userCountData, setUserCountData] = useState(0);
  const [officeCountData, setOfficeCountData] = useState(0);
  const [officeTypeName, setOfficeTypeName] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [countIncome, setCountIncome] = useState(0);
  const [countExpense, setCountExpense] = useState(0);
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [userId, setUserId] = useState(initialuserId);
  const [userData, setUserData] = useState("");
  const [adminStatus, setAdminStatus] = useState("")
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [officeData, setOfficeData] = useState({});

  // Function to update the window width state on window resize
  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {

    // Add a window resize event listener
    window.addEventListener("resize", handleWindowResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const jwtToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTk4OGU3ZS1lODVhLTRjOTQtMGY1Zi0wOGQ4ZjFmMWI3OTkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiU0FkbWluIiwianRpIjoiYjUwODU3OWEtMzg1OS00ZTlhLTg0MTgtM2Q3ZDZkNTMxYzYxIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI1ZTk4OGU3ZS1lODVhLTRjOTQtMGY1Zi0wOGQ4ZjFmMWI3OTkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBlckFkbWluIiwiZXhwIjoxNzE5NTc4MTEzLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMxODcxIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMTg3MSJ9.v3VG1otpCu71imrgb_mVrGkQmVduWNHu28HuikQcp2A";
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
        setUserData(userData);
        if (userData.roleName === "CompanyAdmin") {
          setAdminStatus(6)
        }
        else if (userData.roleName === "PumpAdmin") {
          setAdminStatus(0)
        }
        else {
          setAdminStatus(0)

        }
        const officeId = userData.officeId;

        // Use the officeId to construct the second API endpoint
        const apiUrl2 = `http://115.124.120.251:5059/api/Dashboard/AdminDashboradData/${officeId}/${userData.roleName === "PumpUser" ? 1 : userData.roleName === "CompanyAdmin" ? 1 : 1}`;

        // Fetch data from the second API endpoint
        const response2 = await axios.get(apiUrl2, { headers });
        const data2 = response2.data;
        setOfficeData(data2);

        // Now you have all the data from apiUrl2 available in the 'data2' object
        const userCountData = data2.userCount || [];
        const officeCountData = data2.officeCount || [];
        const totalIncome = data2.incomeDetails.total;
        const countIncome = data2.incomeDetails.count;
        const totalExpense = data2.expenseDetails.total;
        const countExpense = data2.expenseDetails.count;

        // console.log(userCountData);
        // console.log(officeCountData);
        // console.log(totalIncome);
        // console.log(countIncome);
        // console.log(totalExpense);
        // console.log(countExpense);

        setUserCountData(userCountData);
        setOfficeCountData(officeCountData);

        setTotalIncome(totalIncome);
        setTotalExpense(totalExpense);
        setCountIncome(countIncome);
        setCountExpense(countExpense);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleThemeChange = (checked) => {
    const newThemeMode = checked ? "dark" : "light";
    setThemeMode(newThemeMode);

    // Update URL with the new theme mode and user ID parameters
    urlParams.set("theme", newThemeMode);
    urlParams.set("userId", userId);
    urlParams.set("jwtToken", jwtToken);

    const newUrl = `${location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const renderSwitchIcon = () => {
    return themeMode === "dark" ? (
      <FaSun className={css.switchIcon} size={25} />
    ) : (
      <FaMoon className={css.switchIcon} size={25} />
    );
  };

  return (
    <div
      className={`${css.container} ${themeMode === "dark" ? css.darkMode : css.lightMode
        } ${css.scrollableContainer} .container`}
    >
      <div className={`${css.dashboard} `}>
        <div
          className={`${css.dashboardHead} ${themeMode === "dark" ? "theme-container" : "theme2-container"
            }`} style={{minHeight:"185px",minWidth:"100%"}}
        >
           {/* <div className="d-flex w-100">
              <div className="w-100">
              <SkeletonTheme height={10} width={"40%"} highlightColor="#000" baseColor="#000">
         
                  <Skeleton count={1} style={{marginLeft:"5px",marginRight:"5px"}}/>
 
              </SkeletonTheme>
        
              </div>
              
            </div> */}
            {/* <Skeleton variant="rounded" width={"21%"} height={"100%"} /> */}
          <div
            className={`${css.cards} ${themeMode === "dark" ? css.darkMode : css.lightMode
              }`}
          >
            <Suspense fallback={ <Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}>
              {officeData?<UserCard userCountData={userCountData} />:<Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}
            </Suspense>
            <Suspense fallback={ <Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}>
              {officeData?<OfficeCard officeCountData={officeCountData} />:<Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}
            </Suspense>
            <Suspense fallback={ <Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}>
              {officeData?<SalesCard totalIncome={totalIncome} countIncome={countIncome}/>:<Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}
            </Suspense>
            <Suspense fallback={ <Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}>
              {officeData?<ExpenseCard totalExpense={totalExpense} countExpense={countExpense}/>:<Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"auto"} style={{borderRadius:"10px",paddingTop:"135px",margin:"10px"}}/>}
            </Suspense>
            
            {/* <Skeleton variant="rounded" width={windowWidth>900?"22%":windowWidth>768?"45%":"100%"} height={"100%"} style={{borderRadius:"10px"}}/> */}
            
           
            {/* <UserCard userCountData={userCountData} /> */}
            {/* <div className={css.card1} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              <div className={css.cardHead}>
                <span>Users</span>
                <span>
                  <FaUser size={50} />
                </span>
              </div>
              {Array.isArray(userCountData) && userCountData.length > 0 ? (
                userCountData.map((entry, index) => (
                  <div className={css.cardAmount} key={index}>
                    <span>{entry.roleName} :</span>
                    <span>{entry.userCount}</span>
                  </div>
                ))
              ) : (
                <div className={css.cardAmount}>
                  <span>No user data available</span>
                </div>
              )}
            </div> */}
            {/* <div className={css.card2} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              <div className={css.cardHead}>
                <span>Office</span>
                <span>
                  <FaBuilding size={50} />
                </span>
              </div>
              {Array.isArray(officeCountData) && officeCountData.length > 0 ? (
                officeCountData.map((entry, index) => (
                  <div className={css.cardAmount} key={index}>
                    <span>{entry.officeTypeName} :</span>
                    <span>{entry.officeCount}</span>
                  </div>
                ))
              ) : (
                <div className={css.cardAmount}>
                  <span>No office data available</span>
                </div>
              )}
            </div> */}

            {/* <div className={css.card3} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              <div className={css.cardHead} >
                <span>Sales</span>
                <span>
                  <FaMoneyBill size={50} />
                </span>
              </div>

              <div className={css.cardAmount} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: "20px" }}>7 days</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{countIncome}</span>
                  <i>
                    <FaArrowUp size={20} />
                  </i>
                </div>
                <div>
                  <span>₹</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalIncome}</span>
                </div>
              </div>
            </div> */}
             {/* <div className={css.card4} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              <div className={css.cardHead}>
                <span>Expense</span>
                <span>
                  <FaMoneyBillAlt size={50} />
                </span>
              </div>
              <div className={css.cardAmount} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: "20px" }}>7 days</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{countExpense}</span>
                  <i>
                    <FaArrowUp size={20} />
                  </i>
                </div>
                <div>

                  <span>₹</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalExpense}</span>
                </div>
              </div>
            </div>   */}

          </div>
        </div>

        {userData ? <Statistics themeMode={themeMode} officeId={userData.officeId} adminStatus={adminStatus} /> : ''}

      </div>
    </div>
  );
};

export default Dashboard;
