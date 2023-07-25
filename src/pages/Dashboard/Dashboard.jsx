import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaMoneyBill,
  FaMoneyBillAlt,
  FaSun,
  FaMoon,
  FaArrowUp,
} from "react-icons/fa";
import Switch from "react-switch";
import Statistics from "../../components/Statistics/Statistics";
import Orders from "../../components/Orders/Orders";
import css from "./Dashboard.module.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const Dashboard = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialThemeMode = urlParams.get("theme") || "light"; // Read theme mode from URL parameter
  const initialuserId = urlParams.get("userId");

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

        const officeId = userData.officeId;

        // Use the officeId to construct the second API endpoint
        const apiUrl2 = `http://115.124.120.251:5059/api/Dashboard/AdminDashboradData/${officeId}/1`;

        // Fetch data from the second API endpoint
        const response2 = await axios.get(apiUrl2, { headers });
        const data2 = response2.data;

        // Now you have all the data from apiUrl2 available in the 'data2' object
        const userCountData = data2.userCount || [];
        const officeCountData = data2.officeCount || [];
        const totalIncome = data2.incomeDetails.total;
        const countIncome = data2.incomeDetails.count;
        const totalExpense = data2.expenseDetails.total;
        const countExpense = data2.expenseDetails.count;

        console.log(userCountData);
        console.log(officeCountData);
        console.log(totalIncome);
        console.log(countIncome);
        console.log(totalExpense);
        console.log(countExpense);

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
      className={`${css.container} ${
        themeMode === "dark" ? css.darkMode : css.lightMode
      } ${css.scrollableContainer}`}
    >
      <div className={`${css.dashboard} `}>
        <div
          className={`${css.dashboardHead} ${
            themeMode === "dark" ? "theme-container" : "theme2-container"
          }`}
        >
          <div className={css.head}>
            <span>
              <h5>
                <b>Dashboard</b>
              </h5>
            </span>
            {/* <Switch
              className={css.themeSwitch}
              checked={themeMode === "dark"}
              onChange={handleThemeChange}
              checkedIcon={renderSwitchIcon()}
              uncheckedIcon={renderSwitchIcon()}
              offColor="#2f3542"
              onColor="#f1c40f"
              height={26}
              width={50}
              handleDiameter={24}
            /> */}
          </div>

          <div
            className={`${css.cards} ${
              themeMode === "dark" ? css.darkMode : css.lightMode
            }`}
          >
            <div className={css.card1}>
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
            </div>
            <div className={css.card2}>
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
            </div>

            <div className={css.card3}>
              <div className={css.cardHead}>
                <span>Sales</span>
                <span>
                  <FaMoneyBill size={50} />
                </span>
              </div>

              <div className={css.cardAmount}>
                <span>Last 7 day's update</span>

                <span>{countIncome}</span>
                <i>
                  <FaArrowUp size={20} />
                </i>
                <span>₹</span>
                <span>{totalIncome}</span>
              </div>
            </div>
            <div className={css.card4}>
              <div className={css.cardHead}>
                <span>Expense</span>
                <span>
                  <FaMoneyBillAlt size={50} />
                </span>
              </div>
              <div className={css.cardAmount}>
                <span>Last 7 day's update</span>
                <span>{countExpense}</span>
                <i>
                  <FaArrowUp size={20} />
                </i>
                <span>₹</span>
                <span>{totalExpense}</span>
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
