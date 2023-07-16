import React from 'react'
import OrdersPieChart from '../OrdersPieChart/OrdersPieChart'
import OrdersPieChart2 from '../OrdersPieChart2/OrdersPieChart2'
import css from './Orders.module.css'
import { useEffect, useState } from 'react';
import axios from 'axios';



const Orders = ({ themeMode }) => {
    const [orderData, setOrderData] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
  
    // useEffect(() => {
    //   axios.get('http://localhost:3000/orders') // Replace with the URL of your orders API
    //     .then(response => {
    //       const orderData = response.data.slice(0, 4); // Fetching only the first 4 orders
    //       setOrderData(orderData);

    //     // Calculate total price
    //     const totalPrice = orderData.reduce((sum, order) => sum + order.Price_Each, 0);
    //     setTotalPrice(totalPrice);
    //     })
    //     .catch(error => {
    //       console.error('Error fetching order data:', error);
    //     });
    // }, []);
  
    return (
      <div className={`${css.container} ${themeMode === 'dark' ? 'theme-container' : 'theme2-container'}`}>
        <div className={css.head}>
          <img src="./logo.png" alt="logo" />
          <span>Orders today</span>
        </div>
  
        <div className={`${css.stat} ${themeMode === 'dark' ? 'grey-container' : 'silver-container'}`}>
          {/* <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>Total Price of Products</span> */}
          {/* <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>₹{totalPrice.toFixed(2)}</span> */}
        </div>
  
        <div className={css.orders}>
          {orderData.map((order, index) => (
            <div key={index} className={css.order}>
              <div>
                {/* <span style={{ color: themeMode === 'light' ? 'black' : '#D3D3D3' }}>{order.Product}:</span> */}
                {/* <span>₹ {order.Price_Each}</span> */}
              </div>
              
            </div>
          ))}
        </div>
  
        <div className={css.orderChart}>
          <span><h3>Product Wise Sales</h3></span>
          <OrdersPieChart themeMode={themeMode}/>
          <OrdersPieChart2 themeMode={themeMode}/>
        </div>
      </div>
    );
  };


export default Orders