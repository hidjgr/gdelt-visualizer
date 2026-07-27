import { useState } from "react";
import logo from './logo.svg';
import Globe from 'react-globe.gl';
import './App.css';
import data from "./data/export.json";

function App() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  return (
    <div className="App">
      <Globe
        globeTileEngineUrl={(x, y, l) =>
                `https://tile.openstreetmap.org/${l}/${x}/${y}.png` }
        pointsData={data}
        pointLat={d => parseFloat(d.ActionGeo_Lat)}
        pointLng={d => parseFloat(d.ActionGeo_Long)}
        pointAltitude={d => Number(d.NumMentions) / 1000}
        pointColor={d => Number(d.AvgTone) < 0 ? "red" : "green"}
        onPointClick={(point) => {
          setSelectedPoint(point);
        }}
      />

      {selectedPoint && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "400px"
          }}
        >
          <h3>{selectedPoint.ActionGeo_FullName}</h3>

          <p>
            {selectedPoint.Actor1Name} → {selectedPoint.Actor2Name}
          </p>

          <p>
            Tone: {selectedPoint.AvgTone}
          </p>

          <a
            href={selectedPoint.SOURCEURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read article
          </a>

          <button onClick={() => setSelectedPoint(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}


export default App;
