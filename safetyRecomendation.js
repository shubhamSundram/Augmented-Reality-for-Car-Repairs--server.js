// SafetyRecommendations.js
const express = require("express");
const mongoose = require("mongoose");

// MongoDB Model
const SafetySchema = new mongoose.Schema({
  roadName: String,
  accidents: Number, // Number of accidents reported
  roadCondition: String, // "Good", "Average", "Poor"
  trafficDensity: Number, // Vehicles per hour
  safetyScore: Number, // Pre-calculated safety score (0-100)
});
const SafetyData = mongoose.model("SafetyData", SafetySchema);

// Constants for Recommendations
const SAFETY_SCORE_THRESHOLD = {
  High: 80,   // 80 and above: High Safety
  Medium: 50, // 50 to 79: Medium Safety
  Low: 0,     // Below 50: Low Safety
};

// Express App Setup
const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/roadSafety", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint: Get Actionable Safety Recommendations
app.get("/api/safety/recommendations", async (req, res) => {
  try {
    const roads = await SafetyData.find();

    const recommendations = roads.map((road) => {
      let safetyLevel;
      let action;
      
      // Classify Safety Level Based on Safety Score
      if (road.safetyScore >= SAFETY_SCORE_THRESHOLD.High) {
        safetyLevel = "High";
        action = "Road is in good condition. No immediate action required.";
      } else if (road.safetyScore >= SAFETY_SCORE_THRESHOLD.Medium) {
        safetyLevel = "Medium";
        action = "Moderate safety. Consider improving road conditions and traffic management.";
      } else {
        safetyLevel = "Low";
        action = "High risk. Immediate action required: Improve lighting, road conditions, and reduce traffic density. Prioritize enforcement of traffic laws.";
      }

      return {
        roadName: road.roadName,
        safetyScore: road.safetyScore,
        safetyLevel,
        action,
      };
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching safety data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sample Endpoint: Add Road Data (For Testing)
app.post("/api/add-road", async (req, res) => {
  const { roadName, accidents, roadCondition, trafficDensity, safetyScore } = req.body;
  try {
    const road = new SafetyData({ roadName, accidents, roadCondition, trafficDensity, safetyScore });
    await road.save();
    res.status(201).json({ message: "Road data added successfully!" });
  } catch (error) {
    console.error("Error adding road data:", error);
    res.status(500).json({ error: "Failed to add road data" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
