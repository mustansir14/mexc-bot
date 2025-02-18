import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Dashboard from "./components/dashboard";
import CreateBot from "./components/CreateBot";
import ConnectAPI from "./components/ConnectAPI";
import Contact from "./components/Contact";
import Bots from "./components/Bots";
import { DataProvider } from "./components/context";

const App = () => {
  const [navOpen, setNavOpen] = useState(false);  // Sidebar state in parent component

  return (
    <DataProvider>
    <Router>
      <button className="menu-button" onClick={() => setNavOpen(!navOpen)}>&#9776;</button>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />  {/* Sidebar stays outside Routes */}
      <div className={`content ${navOpen ? "shifted" : ""}`}>  {/* Move content when sidebar opens */}
        <Routes>
        <Route path="/" element={<ConnectAPI />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-bot" element={<CreateBot />} />
          <Route path="/connect" element={<ConnectAPI />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bots" element={<Bots />} />
        </Routes>
      </div>
    </Router>
    </DataProvider>
  );
};

export default App;
