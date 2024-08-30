import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './SeeTomorrow.css'; // Import the custom CSS file

const SeeTomorrow = () => {
  const [tides, setTides] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get tomorrow's date in the format YYYYMMDD
  const getFormattedTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Get tomorrow's date in the format mm/dd/yyyy
  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchTides = async () => {
      const tomorrow = getFormattedTomorrowDate();
      try {
        const response = await fetch(
          `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${tomorrow}&end_date=${tomorrow}&station=8720259&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`
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

    fetchTides();
  }, []);

  return (
    <Container className="seetomorrow-container mt-0">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <div className="header-container mb-4 text-center">
            <h1 className="mb-2 modern-title">--------------------</h1>
            </div>
            <div className="mb=4 text-center">
            <p className="date-display">{getTomorrow()}</p>
            </div>
          {error ? (
            <Alert variant="danger" className="text-center mt-4">
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
            <p className="text-center mt-4">No tide data available.</p>
          )}
            <div className="text-center mt-4">
            <Button 
              variant="primary" 
              className="back-button" 
              onClick={() => navigate('/')}
            >
              Back to Today
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SeeTomorrow;
