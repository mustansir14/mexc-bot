import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import { useNavigate } from "react-router-dom";
import "../Styles/model.css";

const Bots = () => {
  const [bots, setBots] = useState([]);
  const [connected, setConnected] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    if (!apiKey || !apiSecret) {
      setConnected(false);
    } else {
      fetchBots();
      setConnected(true);
    }
  }, []);

  const fetchBots = () => {
    fetch("http://localhost:8000/bots")
      .then((response) => response.json())
      .then((data) => {
        setBots(data);
        console.log("Fetched Bots:", data);
      })
      .catch((error) => console.error("Error fetching bots:", error));
  };

  const handleDisconnect = () => {
    localStorage.removeItem("apiKey");
    localStorage.removeItem("apiSecret");
    navigate("/connect");
  };

  const handleRun = (botId) => {
    fetch(`http://localhost:8000/bots/run/${botId}`, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("API not connected, please connect to API");
        }
        return response.json();
      })
      .then(() => {
        setBots((prevBots) =>
          prevBots.map((bot) =>
            bot.id === botId ? { ...bot, is_active: true } : bot
          )
        );
      })
      .catch((error) => alert(error.message));
};

const handleStop = (botId) => {
    fetch(`http://localhost:8000/bots/stop/${botId}`, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("API not connected, please connect to API");
        }
        return response.json();
      })
      .then(() => {
        setBots((prevBots) =>
          prevBots.map((bot) =>
            bot.id === botId ? { ...bot, is_active: false } : bot
          )
        );
      })
      .catch((error) => alert(error.message));
};
  const handleDelete = (botId) => {
    fetch(`http://localhost:8000/bots/${botId}`, { method: "DELETE" })
      .then(() => fetchBots())
      .catch((error) => console.error("Error deleting bot:", error));
  };

  return (
    <div className="bots-container">
      <button className="menu-button" onClick={() => setNavOpen(true)}>
        &#x2630;
      </button>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />

      <div className="bots-box">
       {connected ? (
          <>
            <h2 className="title">My Bots</h2>
            <div className="bots-table-container">
              <table className="bots-table">
                <thead>
                  <tr>
                    <th>Trading Pair</th>
                    <th>Min Order</th>
                    <th>Min Interval</th>
                    <th>Max Interval</th>
                    <th>Min Order Percentage</th>
                    <th>Max Order Percentage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.length > 0 ? (
                    bots.map((bot) => (
                      <tr key={bot.id}>
                        <td>{bot.trading_pair}</td>
                        <td>{bot.min_order_value}</td>
                        <td>{bot.min_interval}</td>
                        <td>{bot.max_interval}</td>
                        <td>{bot.order_percentage_min}</td>
                        <td>{bot.order_percentage_max}</td>
                        <td className="bot-actions">
                          <button
                            className="run-btn"
                            onClick={() => handleRun(bot.id)}
                            disabled={bot.is_active}
                          >
                            {bot.is_active ? "Running" : "Run"}
                          </button>
                          <button
                            className="stop-btn"
                            onClick={() => handleStop(bot.id)}
                            disabled={!bot.is_active}
                          >
                            Stop
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(bot.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No bots available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button className="disconnect" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <h2 className="title">⚠️ API Not Connected. Please connect first.</h2>
        )}
      </div>
    </div>
  );
};

export default Bots;
