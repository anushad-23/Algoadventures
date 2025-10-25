import React from 'react';
import './Map.css';

const regions = [
  { id: 'algorithms', name: 'Algorithms', x: 0, y: 0, color: 'map-region-blue' },
  { id: 'data-structures', name: 'Data Structures', x: 1, y: 0, color: 'map-region-green' },
  { id: 'programming', name: 'Programming', x: 0, y: 1, color: 'map-region-purple' },
  { id: 'logic', name: 'Logic', x: 1, y: 1, color: 'map-region-orange' },
  { id: 'math', name: 'Math', x: 2, y: 0, color: 'map-region-red' },
  { id: 'science', name: 'Science', x: 2, y: 1, color: 'map-region-yellow' },
  { id: 'history', name: 'History', x: 0, y: 2, color: 'map-region-pink' },
];

const Map = ({ playerPosition, unlockedRegions, onMove, onEnterRegion }) => {
  return (
    <div className="map-container">
      {regions.map((region) => {
        const isUnlocked = unlockedRegions.includes(region.id);
        const isPlayerHere = playerPosition.x === region.x && playerPosition.y === region.y;
        return (
          <div
            key={region.id}
            className={`map-region ${isUnlocked ? region.color : 'map-region-locked'} ${isPlayerHere ? 'map-region-active' : ''}`}
            onClick={() => {
              if (isPlayerHere) {
                onEnterRegion(region.id);
              } else if (isUnlocked) {
                onMove({ x: region.x, y: region.y });
              }
            }}
          >
            <div className="map-region-content">
              <div className="map-region-name">{region.name}</div>
              {isPlayerHere && <div className="map-player-icon">🧑‍🎓</div>}
              {!isUnlocked && <div className="map-locked-label">Locked</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Map;
