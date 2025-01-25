// HazardReportingSystem.js (Backend - Node.js + Express)
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Initialize Express App
const app = express();
app.use(bodyParser.json());

// MongoDB Models
const SafetySchema = new mongoose.Schema({
  roadName: String,
  accidents: Number,
  trafficDensity: Number,
  safetyScore: Number, // Safety score of the road
});
const HazardSchema = new mongoose.Schema({
  roadName: String,
  description: String, // Hazard description
  latitude: Number,
  longitude: Number,
  dateReported: { type: Date, default: Date.now },
});
const SafetyData = mongoose.model("SafetyData", SafetySchema);
const HazardReport = mongoose.model("HazardReport", HazardSchema);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/roadSafety", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint to report a hazard
app.post("/api/report-hazard", async (req, res) => {
  const { roadName, description, latitude, longitude } = req.body;
  try {
    const newHazard = new HazardReport({
      roadName,
      description,
      latitude,
      longitude,
    });
    await newHazard.save();
    res.status(201).json({ message: "Hazard reported successfully!" });
  } catch (error) {
    console.error("Error reporting hazard:", error);
    res.status(500).json({ error: "Failed to report hazard" });
  }
});

// Endpoint to get safety score of a road
app.get("/api/safety/score/:roadName", async (req, res) => {
  const { roadName } = req.params;
  try {
    const safetyData = await SafetyData.findOne({ roadName });
    if (!safetyData) {
      return res.status(404).json({ error: "Road not found" });
    }
    res.json({
      roadName: safetyData.roadName,
      safetyScore: safetyData.safetyScore,
      accidents: safetyData.accidents,
      trafficDensity: safetyData.trafficDensity,
    });
  } catch (error) {
    console.error("Error fetching safety score:", error);
    res.status(500).json({ error: "Failed to fetch safety score" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
