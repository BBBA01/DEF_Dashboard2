import React from 'react'
import { FaBuilding } from 'react-icons/fa'
import css from "./Dashboard.module.css";

export default function OfficeCard({officeCountData}) {
  return (
    <div className={css.card2} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
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
  )
}
