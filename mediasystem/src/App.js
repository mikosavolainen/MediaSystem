import { useState } from "react";
import React from 'react';
import { Box, AppBar, Toolbar, Button } from "@mui/material";
import { Route, Routes, Link } from 'react-router-dom';
import Login from "./components/login";
import UploadMedia from "./components/UploadMedia";
import Getmedia from "./components/Getmedia";

function App() {
  const [token, setToken] = useState(null);

  if (!token) {
    return <Login token={token} setToken={setToken} />;
  }

  return (
    <Box width="100%" height="100%">
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Button component={Link} to="/" color="inherit">Upload Media</Button>
          <Button component={Link} to="/getmedia" color="inherit">Get Media</Button>
          <Button color="inherit" onClick={() => setToken(null)}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* Routes */}
      <Box p={3}>
        <Routes>
          <Route path="/" element={<UploadMedia token={token} />} />
          <Route path="/getmedia" element={<Getmedia token={token} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
