const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

// app.use(offerRoutes);

app.get("/", (req, res) => {
  try {
    return res.status(200).json("Welcome on Server 🚀")
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

app.all("*", (req, res) => {
  try {
    return res.status(404).json("Page not found");
  } catch (error) {
    return res.status(400).json({ messege: error.message });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server started !");
});
