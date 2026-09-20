const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const matchingRoutes = require("./routes/matching");

const app = express();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/matching", matchingRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("FarmConnect Backend is Running!");
});

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing. Add it to the backend environment variables.");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Add it to the backend environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully!");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer().catch(error => {
        console.error("Backend startup failed:", error.message);
        process.exit(1);
    });
}

module.exports = { app, startServer };
// ==========================================
// BUYER - PLACE ORDER
// ==========================================

async function placeOrder(productId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    const quantity = prompt(
        "Enter quantity you want to buy (kg):"
    );

    if (!quantity) {
        return;
    }

    const quantityNumber = Number(quantity);

    if (
        isNaN(quantityNumber) ||
        quantityNumber <= 0
    ) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    productId: productId,
                    quantity: quantityNumber
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert(
                "✅ Order placed successfully!\n\n" +
                "Total: ₹" + data.order.totalPrice
            );

            // Reload marketplace
            loadMarketplaceProducts();

        } else {

            alert(
                "❌ " +
                (data.message || "Could not place order")
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            "❌ Cannot connect to backend."
        );
    }
}
