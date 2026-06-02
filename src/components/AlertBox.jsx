import { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });

    // Auto-dismiss after 5 seconds
    setTimeout(() => setAlert(null), 5000);
  };

  const dismissAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ alert, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
