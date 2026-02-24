require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

app.use(limiter);

app.use("/api", chatRoutes);

app.get("/api", (req, res) => {
  console.log("welcome to page");
  res.json({ message: "boom" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
