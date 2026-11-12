import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FinSightShell } from "./components/finsight/FinSightShell";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<FinSightShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
