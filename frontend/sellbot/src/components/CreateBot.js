import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./sidebar";
import { DataContext } from "./context";
import "../Styles/model.css"

const CreateBot = () => {
  const [navOpen, setNavOpen] = useState(true);
  const [connected, setConnected] = useState(false);
  const { data } = useContext(DataContext);  // Get data from context
  // const tradingPairData = data.trading_pairs || [];  
  const [tradingPair, setTradingPair] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [minInterval, setMinInterval] = useState("");
  const [maxInterval, setMaxInterval] = useState("");
  const [minOrderPercentage, setMinOrderPercentage] = useState("");
  const [maxOrderPercentage, setMaxOrderPercentage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    if (!apiKey || !apiSecret) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  }, []);

  useEffect(() => {
    if (data && data.trading_pairs) {
      setLoading(false); // Stop loading when tradingPairData is available
    }
    console.log("Trading Pair Data:", data); // For debugging
  }, [data]); // Runs when tradingPairData changes

  const addBot = () => {
    if (!tradingPair) {
      alert("Please select a trading pair.");
      return;
    }
    if (!minOrderValue) {
      alert("Please enter Min Order Value.");
      return;
    }
    if (!minInterval) {
      alert("Please enter Min Interval.");
      return;
    }
    if (!maxInterval) {
      alert("Please enter Max Interval.");
      return;
    }
    if (!minOrderPercentage) {
      alert("Please enter Min Order Percentage.");
      return;
    }
    if (!maxOrderPercentage) {
      alert("Please enter Max Order Percentage.");
      return;
    }
    
    // Convert values to numbers for validation
    const minIntervalNum = parseFloat(minInterval);
    const maxIntervalNum = parseFloat(maxInterval);
    const minOrderPercentNum = parseFloat(minOrderPercentage);
    const maxOrderPercentNum = parseFloat(maxOrderPercentage);
  
    if (minIntervalNum > maxIntervalNum) {
      alert("Min Interval cannot be larger than Max Interval.");
      return;
    }
  
    if (minOrderPercentNum > maxOrderPercentNum) {
      alert("Min Order Percentage cannot be larger than Max Order Percentage.");
      return;
    }
  
    fetch("http://localhost:8000/bots/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trading_pair: tradingPair.trim(),
        min_order_value: minOrderValue,
        min_interval: minInterval,
        max_interval: maxInterval,
        order_percentage_min: minOrderPercentage,
        order_percentage_max: maxOrderPercentage,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("The provided details are incorrect.");
        }
        return res.json();
      })
      .then(() => {
        setSuccessMessage("Bot added successfully!");
      })
      .catch((err) => {
        console.error("API connection error:", err);
        alert("Failed to connect to API. Please check console for details.");
      });
  };
  return (
    <div className="createbot-container">
      <button className="menu-button" onClick={() => setNavOpen(true)}>
        &#x2630;
      </button>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />
      <div className="createbot-box">
        {connected ? (
          <>
            <h2 className="title">Create Bot</h2>
            <div className="form">
              <select
                className="input"
                value={tradingPair || ""}
                onChange={(e) => setTradingPair(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a Trading Pair</option>
                {loading ? (
                  <option>Loading...</option>
                ) : (
                  data.trading_pairs.map((pair, index) => (
                    <option key={index} value={pair}>
                      {pair}
                    </option>
                  ))
                )}
              </select>
              <input
                className="input"
                type="number"
                placeholder="Min Order Value"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Min Interval"
                value={minInterval}
                onChange={(e) => setMinInterval(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Max Interval"
                value={maxInterval}
                onChange={(e) => setMaxInterval(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Min Order Percentage"
                value={minOrderPercentage}
                onChange={(e) => setMinOrderPercentage(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Max Order Percentage"
                value={maxOrderPercentage}
                onChange={(e) => setMaxOrderPercentage(e.target.value)}
              />
              <button className="disconnect" onClick={addBot}>Add Bot</button>
              {successMessage && <p className="success-message">{successMessage}</p>}
            </div>
          </>
        ) : (
          <h2 className="title">⚠️ API Not Connected. Please connect first.</h2>
        )}
      </div>
    </div>
  );
};

export default CreateBot;
