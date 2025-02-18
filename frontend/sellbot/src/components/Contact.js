import React, { useState } from "react";
import Sidebar from "./sidebar";
import "../Styles/Contact.css";

const Contact = () => {
  const [navOpen, setNavOpen] = useState(true);

  return (
    <div className="contact-container">
      {/* Sidebar toggle button */}
      <button className="menu-button" onClick={() => setNavOpen(true)}>&#x2630;</button>

      {/* Sidebar Component */}
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />

      <div className="contact-box">
        <h2 className="title">Contact Us</h2>
        <p className="contact-info">📞 Phone: +92XXXXXXXXXX</p>
      </div>
    </div>
  );
};

export default Contact;
