import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './Map';
import AlgoAdventures from './AlgoAdventures';
import './Home.css';

const Home = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState(0);
  const [unlockedRegions, setUnlockedRegions] = useState(['algorithms']);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/progress?user=player1');
      const data = response.data;
      setPlayerPosition(data.position);
      setPoints(data.points);
      setUnlockedRegions(data.unlocked_regions);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await axios.post('http://localhost:5000/api/progress', {
        user: 'player1',
        position: playerPosition,
        points,
        unlocked_regions: unlockedRegions
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const movePlayer = (newPosition) => {
    setPlayerPosition(newPosition);
    saveProgress();
  };

  const enterRegion = (region) => {
    if (unlockedRegions.includes(region)) {
      setCurrentRegion(region);
      setShowGame(true);
    }
  };

  const onGameComplete = (score) => {
    setPoints(points + score);
    // Unlock next region based on points or score
    if (score >= 15 && !unlockedRegions.includes('data-structures')) {
      setUnlockedRegions([...unlockedRegions, 'data-structures']);
    }
    setShowGame(false);
    saveProgress();
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">AlgoAdventures World</h1>
        <div className="home-stats">
          <div className="home-stat-item">Points: {points}</div>
          <div className="home-stat-item">Position: ({playerPosition.x}, {playerPosition.y})</div>
        </div>
        {!showGame ? (
          <Map
            playerPosition={playerPosition}
            unlockedRegions={unlockedRegions}
            onMove={movePlayer}
            onEnterRegion={enterRegion}
          />
        ) : (
          <AlgoAdventures
            subject={currentRegion}
            onComplete={onGameComplete}
            onBack={() => setShowGame(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
