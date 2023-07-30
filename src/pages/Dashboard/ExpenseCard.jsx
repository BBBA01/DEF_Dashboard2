import React from 'react'
import css from "./Dashboard.module.css";
import { FaArrowUp, FaMoneyBillAlt } from 'react-icons/fa';

export default function OfficeCard({countExpense,totalExpense}) {
  return (
    <div className={css.card4} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
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
  </div>
  )
}
