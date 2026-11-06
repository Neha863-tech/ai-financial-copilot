import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinSightShell } from "./components/finsight/FinSightShell";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<FinSightShell />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
