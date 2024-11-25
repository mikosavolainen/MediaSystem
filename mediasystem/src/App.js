import { useState } from "react";
import React from 'react';
import { Box } from "@mui/material";
import Login from "./components/login"
import UploadMedia from "./components/UploadMedia";
import Getmedia from "./components/Getmedia"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [ token, setToken ] = useState(null)
  if (!token) {
    return <Login token={token} setToken={setToken}/>
  }
  return<Box width="100%" height="100%">
      <UploadMedia token={token}> </UploadMedia>
      <Getmedia token={token}></Getmedia>
    </Box>
  ;
}

export default App;
