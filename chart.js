// ChartsComponent.js
import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Automatically register chart types

const ChartsComponent = () => {
  const [chartData, setChartData] = useState({});
  const [roadConditionsData, setRoadConditionsData] = useState({});

  // Fetch chart data (accidents, traffic density, road conditions) from the backend
  useEffect(() => {
    fetch("/api/safety/analytics")
      .then((response) => response.json())
      .then((data) => {
        // Bar Chart Data: Accidents and Traffic Density
        setChartData({
          labels: data.map((entry) => entry.region),
          datasets: [
            {
              label: "Accidents",
              data: data.map((entry) => entry.accidents),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
            {
              label: "Traffic Density",
              data: data.map((entry) => entry.trafficDensity),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        });

        // Doughnut Chart Data: Road Conditions (Good, Average, Poor)
        const roadConditionsCount = data.reduce(
          (acc, entry) => {
            acc[entry.roadCondition] = (acc[entry.roadCondition] || 0) + 1;
            return acc;
          },
          { Good: 0, Average: 0, Poor: 0 }
        );

        setRoadConditionsData({
          labels: ["Good", "Average", "Poor"],
          datasets: [
            {
              data: [roadConditionsCount.Good, roadConditionsCount.Average, roadConditionsCount.Poor],
              backgroundColor: ["#4caf50", "#ffeb3b", "#f44336"],
            },
          ],
        });
      })
      .catch((error) => console.error("Error fetching analytics data:", error));
  }, []);

  return (
    <div>
      <h2>Road Safety Analytics</h2>
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", marginTop: "20px" }}>
        {/* Bar Chart: Accidents and Traffic Density */}
        <div style={{ width: "45%" }}>
          <h3>Accidents and Traffic Density</h3>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
            }}
          />
        </div>

        {/* Doughnut Chart: Road Conditions */}
        <div style={{ width: "45%" }}>
          <h3>Road Conditions</h3>
          <Doughnut
            data={roadConditionsData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartsComponent;
