import React from 'react';
import { Link } from 'react-router-dom';
import "./Header.css"
const Header = () => (
    <header>
        <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/upload">Upload Media</Link>
            <Link to="/review">Review Media</Link>
            <Link to="/reports">Reports</Link>
        </nav>
    </header>
);

export default Header;
