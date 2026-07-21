import React, { useMemo, useState, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import sampleEvents from './data/sampleEvents.json';

const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 25,
  zoom: 1.6,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels/style.json';

function goldsteinColor(v) {
  if (v <= -6) return [162, 45, 45];
  if (v <= -2) return [180, 80, 60];
  if (v < 2) return [110, 110, 105];
  if (v < 6) return [80, 140, 60];
  return [50, 110, 40];
}

function toneColor(v) {
  if (v <= -4) return [162, 45, 45];
  if (v <= -1) return [180, 80, 60];
  if (v < 1) return [110, 110, 105];
  if (v < 4) return [80, 140, 60];
  return [50, 110, 40];
}

export default function App() {
  const [events, setEvents] = useState(sampleEvents);
  const [colorMode, setColorMode] = useState('goldstein');
  const [minMentions, setMinMentions] = useState(1);
  const [showActionGeo, setShowActionGeo] = useState(true);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => events.filter(e => e.numMentions >= minMentions),
    [events, minMentions]
  );

  const arcLayer = new ArcLayer({
    id: 'actor-arcs',
    data: filtered,
    getSourcePosition: d => [d.actor1Lon, d.actor1Lat],
    getTargetPosition: d => [d.actor2Lon, d.actor2Lat],
    getSourceColor: d => (colorMode === 'goldstein' ? goldsteinColor(d.goldsteinScale) : toneColor(d.avgTone)),
    getTargetColor: d => (colorMode === 'goldstein' ? goldsteinColor(d.goldsteinScale) : toneColor(d.avgTone)),
    getWidth: d => Math.max(1, Math.sqrt(d.numMentions)),
    getHeight: 0.4,
    pickable: true,
    onClick: ({ object }) => object && setSelected(object)
  });

  const actionLayer = new ScatterplotLayer({
    id: 'action-geo',
    data: showActionGeo ? filtered : [],
    getPosition: d => [d.actionLon, d.actionLat],
    getRadius: 4,
    radiusUnits: 'pixels',
    getFillColor: [230, 200, 120],
    pickable: true,
    onClick: ({ object }) => object && setSelected(object)
  });

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[arcLayer, actionLayer]}
      >
        <Map mapStyle={BASEMAP_STYLE} reuseMaps />
      </DeckGL>

      <div style={panelStyle}>
        <h1 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 12px' }}>GDELT — last hour</h1>

        <label style={labelStyle}>
          Color by
          <select value={colorMode} onChange={e => setColorMode(e.target.value)} style={inputStyle}>
            <option value="goldstein">Goldstein scale</option>
            <option value="tone">Avg tone</option>
          </select>
        </label>

        <label style={labelStyle}>
          Min mentions: {minMentions}
          <input
            type="range"
            min="1"
            max="40"
            value={minMentions}
            onChange={e => setMinMentions(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={showActionGeo}
            onChange={e => setShowActionGeo(e.target.checked)}
          />
          Show ActionGeo points
        </label>

        <p style={{ fontSize: 11, color: '#8a8f98', marginTop: 12, lineHeight: 1.5 }}>
          Arcs connect Actor1Geo → Actor2Geo. Dots mark ActionGeo, the location
          the event text was actually geocoded to. {filtered.length} of {events.length} events shown.
        </p>
      </div>

      {selected && (
        <div style={detailStyle}>
          <button onClick={() => setSelected(null)} style={closeBtnStyle}>×</button>
          <p style={{ fontWeight: 500, margin: '0 0 6px' }}>
            {selected.actor1Name} → {selected.actor2Name}
          </p>
          <p style={detailRow}>Event root code: {selected.eventRootCode}</p>
          <p style={detailRow}>Goldstein scale: {selected.goldsteinScale}</p>
          <p style={detailRow}>Avg tone: {selected.avgTone}</p>
          <p style={detailRow}>Mentions: {selected.numMentions} · Sources: {selected.numSources}</p>
        </div>
      )}
    </div>
  );
}

const panelStyle = {
  position: 'absolute',
  top: 16,
  left: 16,
  width: 260,
  background: 'rgba(20, 22, 26, 0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '14px 16px',
  color: '#e6e6e6',
  fontFamily: 'inherit'
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: '#b8bcc4',
  marginBottom: 12
};

const inputStyle = {
  height: 30,
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.15)',
  background: '#1b1d22',
  color: '#e6e6e6',
  padding: '0 8px'
};

const detailStyle = {
  position: 'absolute',
  bottom: 16,
  left: 16,
  width: 260,
  background: 'rgba(20, 22, 26, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '14px 16px',
  color: '#e6e6e6'
};

const detailRow = { fontSize: 12, color: '#b8bcc4', margin: '2px 0' };

const closeBtnStyle = {
  position: 'absolute',
  top: 8,
  right: 10,
  background: 'transparent',
  border: 'none',
  color: '#b8bcc4',
  fontSize: 16,
  cursor: 'pointer'
};
