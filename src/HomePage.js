import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import './HomePage.css'; // Import the custom CSS file

const HomePage = () => {
  const [tides, setTides] = useState([]);
  const [error, setError] = useState(null);
  const [waterTemp, setWaterTemp] = useState(null);

  // Get today's date in the format YYYYMMDD
  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTides(data.predictions);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchWaterTemp = async () => {
      try {
        const response = await fetch(
          'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=8720218&product=water_temperature&units=english&time_zone=lst_ldt&format=json'
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const temp = parseFloat(data.data[0].v);
        setWaterTemp(temp);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTides();
    fetchWaterTemp();
  }, []);

  return (
    <Container className="homepage-container mt-0">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
        <div className="header-container mb-4 text-center">
        <h1 className="mb-2 modern-title">Tide Predictions for Atlantic Beach</h1>
            <p className="date-display">{getToday()}</p>
          </div>
          {error ? (
            <Alert variant="danger" className="text-center">
              Error fetching data: {error}
            </Alert>
          ) : tides.length > 0 ? (
            tides.map((tide, index) => (
              <Card key={index} className="mb-3 tide-card">
                <Card.Body>
                  <Card.Title>{tide.type === 'H' ? 'High Tide' : 'Low Tide'}</Card.Title>
                  <Card.Text>Height: {tide.v} feet</Card.Text>
                  <Card.Text>{new Date(tide.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center">No tide data available.</p>
          )}
{waterTemp !== null && (
  <Card className={`mt-4 water-temp-card ${waterTemp > 80 ? '' : 'blue'}`}>
    <Card.Body className="text-center">
      <Card.Title>Current Water Temperature</Card.Title>
      <Card.Text>{waterTemp.toFixed(1)}°F</Card.Text>
    </Card.Body>
  </Card>
)}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
