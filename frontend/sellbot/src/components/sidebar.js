import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Sidebar.css";


const Sidebar = ({ navOpen, setNavOpen }) => {
  return (
    <div>
      {/* Menu button */}
      <button 
        className={`menu-button ${navOpen ? "hidden" : ""}`} 
        onClick={() => setNavOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="heading-text">Sellbot</span>
        </div>
        <button className="close-button" onClick={() => setNavOpen(false)}>✖</button>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/bots">My Bots</Link></li>
          <li><Link to="/create-bot">Create Bot</Link></li>
          <li><Link to="/connect">Connect API</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
