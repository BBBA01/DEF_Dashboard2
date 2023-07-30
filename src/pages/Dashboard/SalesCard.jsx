import React from 'react'
import { FaArrowUp, FaMoneyBill } from 'react-icons/fa'
import css from "./Dashboard.module.css";

export default function SalesCard({countIncome,totalIncome}) {
  return (
    <div className={css.card3} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
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
  </div>     
  )
}
