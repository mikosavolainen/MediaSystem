import { useState } from "react";
import React from 'react';
import Login from "./components/login"
import UploadMedia from "./components/UploadMedia";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [ token, setToken ] = useState(null)
  if (!token) {
    return <Login token={token} setToken={setToken}/>
  }
  return (
    <UploadMedia token={token}> </UploadMedia>
  );
}

export default App;
