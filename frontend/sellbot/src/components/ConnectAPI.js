import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import "../Styles/ConnectAPI.css";
import { DataContext } from "./context";

const ConnectAPI = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [navOpen, setNavOpen] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false); // New state for button loading
  const { setData } = useContext(DataContext);
  const navigate = useNavigate();

  const handleConnect = () => {
    setIsConnecting(true); // Set to "Connecting..." state

    fetch("http://localhost:8000/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("The provided details are incorrect.");
      }
      return res.json();
    })
    .then(data => {
      if (data.balances) { 
        setData(data);
        localStorage.setItem("apiData", JSON.stringify(data)); 
        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("apiSecret", apiSecret);
        navigate("/dashboard");
      } else {
        throw new Error("Invalid API credentials.");
      }
    })
    .catch(err => {
      console.error("API connection error:", err);
      alert(err.message || "Failed to connect to API.");
    })
    .finally(() => {
      setIsConnecting(false); // Reset button state after API call completes
    });
  };

  return (
    <div className="connect-container">
      <button className="menu-button" onClick={() => setNavOpen(true)}>&#x2630;</button>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />
      <div className="connect-box">
        <h2 className="title">Connect to API</h2>
        <input className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API Key" />
        <input className="input" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="API Secret" type="password" />
        <button className="button" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default ConnectAPI;
