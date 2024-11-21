import { useState } from "react";
import React from 'react';
import Login from "./components/login"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [ token, setToken ] = useState(null)
  if (!token) {
    return <Login token={token} setToken={setToken}/>
  }
  return (
    <></>
  );
}

export default App;
