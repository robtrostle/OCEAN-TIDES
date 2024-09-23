import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from 'lucide-react';
import "./HomePage.css"; // Import the custom CSS file

// Add this style block at the top of your file or in a separate CSS file
const styles = `
  .navy-gradient {
    background: linear-gradient(135deg, #003366, #006699);
    opacity: 0.9;
  }
  .orange-border {
    border: 4px solid #ffa500;
  }
    .date-display {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    color: #FFFFFF;
    font-weight: 500;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 8px;
    display: inline-block;
    margin-top: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const TideCard = ({ type, height, time, isNextTide }) => (
  <div className={`mb-3 p-4 navy-gradient rounded-lg shadow-md text-white ${isNextTide ? 'orange-border' : ''}`}>
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold mb-2">{type === "H" ? "High Tide" : "Low Tide"}</h3>
        <p className="text-md">Height: {height} feet</p>
        <p className="text-md">{new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
      </div>
      <div className="flex items-center">
        {type === "H" ? 
          <ArrowUp className="text-red-500" size={38} /> : 
          <ArrowDown className="text-green-500" size={38} />
        }
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [tides, setTides] = useState([]);
  const [error, setError] = useState(null);
  const [nextTideIndex, setNextTideIndex] = useState(null);
  const [waterTemp, setWaterTemp] = useState(null);
  const navigate = useNavigate(); // Hook for navigation
  const [windData, setWindData] = useState({ speed: null, direction: null });

  // Get today's date in the format YYYYMMDD
  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Get today's date in the format mmddyyyy
  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchTides = async () => {
      const today = getFormattedDate();
      try {
        const response = await fetch(
          `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${today}&end_date=${today}&station=8720259&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTides(data.predictions);

        // Determine the index of the next tide
        const currentTime = new Date();
        const nextTideIndex = data.predictions.findIndex((tide) => {
          return new Date(tide.t) > currentTime;
        });
        setNextTideIndex(nextTideIndex);
      } catch (error) {
        setError(error.message);
      }
    }

    const fetchWaterTemp = async () => {
      try {
        const response = await fetch(
          "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=8720218&product=water_temperature&units=english&time_zone=lst_ldt&format=json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const temp = parseFloat(data.data[0].v);
        setWaterTemp(temp);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchWindData = async () => {
      try {
        const response = await fetch(
          'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=8720218&product=wind&time_zone=lst_ldt&units=english&application=DataAPI_Sample&format=json'
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const windSpeed = parseFloat(data.data[0].s);
        const windDirection = data.data[0].dr; // Use the "dr" element for direction
        setWindData({ speed: windSpeed, direction: windDirection });
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTides();
    fetchWaterTemp();
    fetchWindData();
  }, []);

  const navigateToTomorrow = () => {
    navigate("/see-tomorrow");
  };

  const navigateToDutton = () => {
    navigate("/dutton-island");
  };

  return (
    <>
      <style>{styles}</style>
      <Container className="homepage-container mt-10 max-w-full">
      <Row className="justify-content-center">
      <Col xs={12} md={8}>
        
      <div className="container mx-auto p-3">
        <div className="max-w-2xl mx-auto">
          <div className="header-container mb-4 text-center">
          <h1 className="modern-title max-w-full text-3xl font-bold mb-2" style={{ 
  color: 'white',
  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
}}>Atlantic Beach, FL</h1>
          <p className="date-display">{getToday()}</p>
          </div>

          
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mt-4" role="alert">
              Error fetching data: {error}
            </div>
          ) : tides.length > 0 ? (
            tides.map((tide, index) => (
              <TideCard
                key={index}
                type={tide.type}
                height={tide.v}
                time={tide.t}
                isNextTide={index === nextTideIndex}
              />
            ))
          ) : (
            <p className="text-center mt-4">No tide data available.</p>
          )}
          {waterTemp !== null && (
            <Card
              className={`mt-4 water-temp-card ${waterTemp > 80 ? "" : "blue"}`}
            >
              <Card.Body className="text-center">
                <Card.Title>Current Water Temperature</Card.Title>
                <Card.Text>{waterTemp.toFixed(1)}°F</Card.Text>
              </Card.Body>
            </Card>
          )}
          {windData.speed !== null && windData.direction !== null && (
            <Card className="mt-4 wind-card">
              <Card.Body className="text-center">
                <Card.Title>Current Wind Speed & Direction</Card.Title>
                <Card.Text>
                  {windData.speed.toFixed(1)} mph, {windData.direction}
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          <div className="text-center mt-4">
            <Col xs="auto">
              <Button 
                className="see-tomorrow-btn mb-3 btn-tomorrow px-6 py-2 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md rounded-md" 
                onClick={navigateToTomorrow}
              >
                Tomorrow's Tides
              </Button>
            </Col>
            <Col xs="auto">
              <Button 
                className="see-tomorrow-btn mb-5 btn-dutton px-6 py-2 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-md rounded-md" 
                onClick={navigateToDutton}
              >
                Dutton Island
              </Button>
            </Col>
          </div>
          </div>
          </div>
          </Col>
          </Row>
          </Container>
          </>
  );
};

export default HomePage;