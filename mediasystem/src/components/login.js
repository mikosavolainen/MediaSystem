import React, { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { styled } from "@mui/system";

const CardContainer = styled(Box)(({ theme }) => ({
    perspective: "1000px",
    width: "400px",
    height: "400px",
    position: "relative",
    margin: "auto",
    borderWidth: "5px"
}));

const Card = styled(Box)(({ isFlipped }) => ({
    width: "100%",
    height: "100%",
    position: "absolute",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
    borderWidth: "5px"
}));

const CardSide = styled(Box)(({ theme }) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
}));

const Front = styled(CardSide)(({ theme }) => ({
    transform: "rotateY(0deg)",
}));

const Back = styled(CardSide)(({ theme }) => ({
    transform: "rotateY(180deg)",
}));

const AuthPage = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    const handleToggle = () => {
        setIsFlipped((prev) => !prev);
        setFormData({ username: "", email: "", password: "" });
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (isLogin) => {
        if (!formData.username.trim()) {
            return "Username is required.";
        }
        if (!isLogin && (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))) {
            return "Valid email is required for registration.";
        }
        if (!formData.password.trim() || formData.password.length < 6) {
            return "Password must be at least 6 characters long.";
        }
        return null;
    };

    const handleSubmit = async (isLogin) => {
        setError(null);

        const validationError = validateForm(isLogin);
        if (validationError) {
            setError(validationError);
            return;
        }

        const endpoint = isLogin ? "/api/login" : "/api/register";
        const payload = isLogin
            ? { username: formData.username, password: formData.password }
            : formData;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                alert(`${isLogin ? "Login" : "Registration"} successful! Token: ${data.token}`);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            bgcolor="#f5f5f5"
        >
            <CardContainer>
                <Card isFlipped={isFlipped}>
                    {/* Front: Login Form */}
                    <Front>
                        <Typography variant="h4" gutterBottom>
                            Login
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Username"
                            name="username"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}
                            onClick={() => handleSubmit(true)}
                        >
                            Login
                        </Button>
                        <Button
                            color="secondary"
                            sx={{ mt: 2 }}
                            onClick={handleToggle}
                        >
                            Switch to Register
                        </Button>
                    </Front>

                    {/* Back: Register Form */}
                    <Back>
                        <Typography variant="h4" gutterBottom>
                            Register
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Email"
                            name="email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Username"
                            name="username"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}
                            onClick={() => handleSubmit(false)}
                        >
                            Register
                        </Button>
                        <Button
                            color="secondary"
                            sx={{ mt: 2 }}
                            onClick={handleToggle}
                        >
                            Switch to Login
                        </Button>
                    </Back>
                </Card>
            </CardContainer>
        </Box>
    );
};

export default AuthPage;
