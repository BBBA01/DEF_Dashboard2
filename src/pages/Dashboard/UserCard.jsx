import React from 'react'
import { FaUser } from 'react-icons/fa'
import css from "./Dashboard.module.css";

export default function UserCard({userCountData}) {
  return (
    <div className={css.card1} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
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
  )
}
