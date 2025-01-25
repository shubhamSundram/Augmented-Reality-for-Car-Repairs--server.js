// road_safety_score.js
const express = require("express");
const mongoose = require("mongoose");

// MongoDB Model
const SafetySchema = new mongoose.Schema({
  roadName: String,
  accidents: Number, // Number of accidents reported
  roadCondition: String, // "Good", "Average", "Poor"
  trafficDensity: Number, // Vehicles per hour
});
const SafetyData = mongoose.model("SafetyData", SafetySchema);

// Constants for Safety Score Calculation
const ROAD_CONDITION_SCORES = { Good: 90, Average: 60, Poor: 30 }; // Road condition weight
const ACCIDENT_WEIGHT = 0.5; // 50% weight for accident data
const ROAD_CONDITION_WEIGHT = 0.3; // 30% weight for road condition
const TRAFFIC_WEIGHT = 0.2; // 20% weight for traffic density

// Utility Function: Calculate Safety Score
const calculateSafetyScore = (accidents, roadCondition, trafficDensity) => {
  // Accident score (higher accidents = lower score)
  const accidentScore = Math.max(0, 100 - accidents * 5);

  // Road condition score
  const roadConditionScore = ROAD_CONDITION_SCORES[roadCondition] || 50;

  // Traffic density score (higher density = lower score)
  const trafficScore = Math.max(0, 100 - trafficDensity / 10);

  // Weighted safety score
  const safetyScore =
    ACCIDENT_WEIGHT * accidentScore +
    ROAD_CONDITION_WEIGHT * roadConditionScore +
    TRAFFIC_WEIGHT * trafficScore;

  return Math.round(safetyScore);
};

// Express App Setup
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/roadSafety", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint: Calculate Safety Scores for All Roads
app.get("/api/safety-scores", async (req, res) => {
  try {
    const roads = await SafetyData.find();
    const results = roads.map((road) => ({
      roadName: road.roadName,
      accidents: road.accidents,
      roadCondition: road.roadCondition,
      trafficDensity: road.trafficDensity,
      safetyScore: calculateSafetyScore(road.accidents, road.roadCondition, road.trafficDensity),
    }));

    res.json(results);
  } catch (error) {
    console.error("Error fetching safety data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sample Endpoint: Add Road Data (For Testing)
app.post("/api/add-road", async (req, res) => {
  const { roadName, accidents, roadCondition, trafficDensity } = req.body;
  try {
    const road = new SafetyData({ roadName, accidents, roadCondition, trafficDensity });
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
