const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const mlModel = require("./ml_model/risk_model"); // Assuming the ML model is already trained and available

// Initialize Express App
const app = express();
app.use(bodyParser.json());

// MongoDB Models
const SafetySchema = new mongoose.Schema({
  roadName: String,
  accidents: Number,
  trafficDensity: Number,
  roadConditions: String, // Good, Average, Poor
  lighting: String, // Well-lit, Dim, Dark
  pedestrianInfrastructure: String, // Present, Absent
  safetyScore: Number,
});
const SafetyData = mongoose.model("SafetyData", SafetySchema);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/roadSafety", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint to get safety score and recommendations for a road
app.get("/api/safety/road/:roadName", async (req, res) => {
  const { roadName } = req.params;

  try {
    const safetyData = await SafetyData.findOne({ roadName });

    if (!safetyData) {
      return res.status(404).json({ error: "Road not found" });
    }

    // Predict accident risk using ML model (using features like traffic density, road conditions, etc.)
    const accidentRiskPrediction = mlModel.predict([{
      trafficDensity: safetyData.trafficDensity,
      roadConditions: safetyData.roadConditions,
      lighting: safetyData.lighting,
      pedestrianInfrastructure: safetyData.pedestrianInfrastructure
    }]);

    const recommendations = generateRecommendations(accidentRiskPrediction, safetyData);

    res.json({
      roadName: safetyData.roadName,
      safetyScore: safetyData.safetyScore,
      accidentRiskPrediction: accidentRiskPrediction[0],
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Error fetching road safety data:", error);
    res.status(500).json({ error: "Failed to fetch road safety data" });
  }
});

// Helper function to generate actionable recommendations based on the predicted risk
function generateRecommendations(riskPrediction, safetyData) {
  let recommendations = [];

  if (riskPrediction > 0.7) { // High risk of accidents
    recommendations.push("Increase traffic monitoring in this area.");
    recommendations.push("Improve road conditions or repair damaged infrastructure.");
    recommendations.push("Install better lighting in poorly lit areas.");
    recommendations.push("Improve pedestrian infrastructure where necessary.");
  } else if (riskPrediction > 0.4) { // Moderate risk
    recommendations.push("Monitor traffic patterns during peak hours.");
    recommendations.push("Enhance road signage and visibility.");
  } else { // Low risk
    recommendations.push("Road is relatively safe. Maintain existing infrastructure.");
  }

  return recommendations;
}

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
