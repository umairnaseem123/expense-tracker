if (process.env.NODE_ENV !== "production") {
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API running" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
module.exports = app;