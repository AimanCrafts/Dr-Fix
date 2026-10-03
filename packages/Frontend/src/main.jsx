import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./client/context/AuthContext.jsx"; // ← নতুন import
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* ← App-কে wrap করলাম */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
