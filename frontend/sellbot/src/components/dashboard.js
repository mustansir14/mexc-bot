import React, { useState, useEffect, useContext } from "react";
import { useNavigate} from "react-router-dom"; 
import Sidebar from "./sidebar";
import { DataContext } from "./context";
import "../Styles/model.css"

const Dashboard = () => {
  const { data, setData } = useContext(DataContext); 
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");
  
    if (!apiKey || !apiSecret) {
      setConnected(false);
      setLoading(false);
      console.log("Connect to API");
    } else {
      setLoading(true); // Indicate loading while fetching
  
      fetch("http://localhost:8000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("The provided details are incorrect.");
          }
          return res.json();
        })
        .then(data => {
          if (data.balances) {
            setData(data); // Set data only
            setConnected(true);
          } else {
            throw new Error("Invalid API credentials.");
          }
        })
        .catch(err => {
          console.error("API connection error:", err);
          alert(err.message || "Failed to connect to API.");
          setConnected(false);
        })
        .finally(() => {
          setLoading(false); // Reset loading state
        });
    }
  }, [setData]);
  
      

  const handleDisconnect = () => {
    localStorage.removeItem("apiKey");
    localStorage.removeItem("apiSecret");
    setConnected(false);
    setData([]);
    navigate("/connect"); 
  };

  return (
    <div className="dashboard-container">
      <button className="menu-button" onClick={() => setNavOpen(true)}>&#x2630;</button>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />

      <div className="dashboard-box">
        {loading ? (
          <h2 className="title">⏳ Loading Dashboard...</h2>
        ) : connected ? (
          <>
            <h2 className="title">✅ API Connected Successfully</h2>

            <div className="balance-card">
              <h3>Wallet Balances</h3>
              <div className="table-container">
                <table className="balance-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Balance</th>
                      <th>Locked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.balances.map((item, index) => (
                      <tr key={index}>
                        <td>{item.asset}</td>
                        <td>{item.free}</td>
                        <td>{item.locked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button className="disconnect" onClick={handleDisconnect}>
              Disconnect
            </button>
          </>
        ) : (
          <h2 className="title">⚠️ API Not Connected. Please connect first.</h2>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
