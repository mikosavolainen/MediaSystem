import { useState } from "react";
import React from 'react';
import Login from "./components/login"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const { token, settoken } = useState(false)
  if (!token) {
    return <Login/>
  }
  return (
    <></>
  );
}

export default App;
