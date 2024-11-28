// src/App.js
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Button } from '@mui/material';
import { Route, Routes, Link } from 'react-router-dom';
import Login from './components/login';
import UploadMedia from './components/UploadMedia';
import Getmedia from './components/Getmedia';
import ReviewMedia from './components/ReviewMedia';
import Getsucsess from './components/Getsucsess';
 
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));


  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  if (!token) {
    return <Login token={token} setToken={setToken} />;
  }

  return (
    <Box width="100%" height="100%">

      <AppBar position="static">
        <Toolbar>
          <Button component={Link} to="/" color="inherit">Upload Media</Button>
          <Button component={Link} to="/getmedia" color="inherit">Get Media</Button>
          <Button component={Link} to="/Getsuccess" color="inherit">Show Success</Button>

          
          <Button color="inherit" onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Logout</Button>
        </Toolbar>
      </AppBar>


      <Box p={3}>
        <Routes>
          <Route path="/" element={<UploadMedia token={token} />} />
          <Route path="/getmedia" element={<Getmedia token={token} />} />
          <Route path="/Getsuccess" element={<Getsucsess token={token} />} />
          <Route path="/review-media/:id" element={<ReviewMedia token={token} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
