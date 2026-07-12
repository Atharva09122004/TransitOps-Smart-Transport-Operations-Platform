const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const driverRoutes = require("./routes/driver.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps API Running 🚚"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);

module.exports = app;