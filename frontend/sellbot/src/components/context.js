import React, { createContext, useState, useEffect } from "react";

// Create Context
export const DataContext = createContext();

// Context Provider Component
export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    // Check if data exists in localStorage and parse it
    const storedData = localStorage.getItem("apiData");
    return storedData ? JSON.parse(storedData) : { balances: [], trading_pairs: [] };
  });

  useEffect(() => {
    // Optionally sync context with localStorage when data changes
    if (data && data.trading_pairs) {
      localStorage.setItem("apiData", JSON.stringify(data));
    }
  }, [data]);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
