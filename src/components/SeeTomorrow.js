import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";


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

const TideCard = ({ type, height, time, isCurrentTide }) => (
  <div className={`mb-3 p-4 navy-gradient rounded-lg shadow-md text-white }`}>
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold mb-2">{type === "H" ? "High Tide" : "Low Tide"}</h3>
        <p className="text-lg">Height: {height} feet</p>
        <p className="text-lg">{new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
      </div>
      <div className="flex items-center">
        {type === "H" ? 
          <ArrowUp className="text-red-500" size={28} /> : 
          <ArrowDown className="text-green-500" size={28} />
        }
      </div>
    </div>
  </div>
);

const SeeTomorrow = () => {
  const [tides, setTides] = useState([]);
  const [error, setError] = useState(null);
  const [currentTideIndex, setCurrentTideIndex] = useState(null);
  const navigate = useNavigate();

  const getFormattedTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
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

        // Determine the index of the current tide
        const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
        const closestTideIndex = data.predictions.findIndex((tide) => {
          const tideTime = new Date(tide.t).getHours() * 60 + new Date(tide.t).getMinutes();
          return Math.abs(tideTime - currentTime) < 120; // 2 hour window
        });
        setCurrentTideIndex(closestTideIndex);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTides();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <Container className="homepage-container mt-10 p-5 mx-auto max-w-full"></Container>

      <div className="container mx-auto mt-10 p-5">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-center">
            <h1 className="modern-title text-3xl font-bold mb-2">Tomorrow's Tide Predictions</h1>
            <p className="date-display">{getTomorrow()}</p>
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
                isCurrentTide={index === currentTideIndex}
              />
            ))
          ) : (
            <p className="text-center mt-4">No tide data available.</p>
          )}

          <div className="text-center mt-4">
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate('/')}
            >
              Back to Today
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeeTomorrow;