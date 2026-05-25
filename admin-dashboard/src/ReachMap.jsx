import { useMemo } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { businesses } from './data'

// Fix Leaflet default icon issue in Vite/bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

function scoreToColor(score) {
  if (score === null || score === undefined) return '#64748b' // slate for no score
  if (score >= 7) return '#10b981' // emerald
  if (score >= 5) return '#f59e0b' // amber
  return '#ef4444' // red
}

function HeatBlob({ center, score, name }) {
  const color = scoreToColor(score)
  const baseRadius = 1800 // meters

  // Create 3 concentric circles for heat effect
  return (
    <>
      <Circle
        center={center}
        radius={baseRadius * 2.5}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.08,
          stroke: false,
        }}
      />
      <Circle
        center={center}
        radius={baseRadius * 1.4}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.15,
          stroke: false,
        }}
      />
      <Circle
        center={center}
        radius={baseRadius}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.28,
          stroke: false,
        }}
      />
      <Marker position={center}>
        <Tooltip
          direction="top"
          offset={[0, -10]}
          opacity={1}
          className="bg-bg-card border border-line text-ink text-[14px] px-2 py-1 rounded-lg shadow-glow"
        >
          <div className="font-semibold">{name}</div>
          {score !== null && <div className="tabular-nums">Score: {score.toFixed(1)}</div>}
          {score === null && <div className="text-ink-3">Sin audit</div>}
        </Tooltip>
      </Marker>
    </>
  )
}

export default function ReachMap({ onSelectBusiness }) {
  const center = [19.0, -99.0] // Center of Mexico, showing south
  const zoom = 5

  const mappedBusinesses = useMemo(() => {
    return businesses
      .filter(b => b.location?.coords)
      .map(b => ({
        id: b.id,
        name: b.name,
        position: [b.location.coords.lat, b.location.coords.lng],
        score: b.score,
        status: b.status,
      }))
  }, [])

  return (
    <div id="reach-map" className="w-full h-[420px] rounded-2xl overflow-hidden border border-line relative bg-bg-elev" style={{ zIndex: 1 }}>
      <style>{`
        #reach-map .leaflet-pane { z-index: 1 !important; }
        .leaflet-container {
          background: #0a0c14 !important;
          font-family: inherit;
        }
        .leaflet-tile-pane {
          filter: grayscale(1) brightness(0.85) contrast(1.1);
        }
        .leaflet-control-attribution {
          background: rgba(10, 12, 20, 0.8) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #64748b !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          margin: 12px !important;
        }
        .leaflet-control-zoom a {
          background: #11131f !important;
          color: #e2e8f0 !important;
          border: 1px solid #1f2337 !important;
          width: 28px !important;
          height: 28px !important;
          line-height: 26px !important;
          font-size: 16px !important;
          border-radius: 6px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1d2e !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedBusinesses.map(biz => (
          <HeatBlob
            key={biz.id}
            center={biz.position}
            score={biz.score}
            name={biz.name}
          />
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-bg-card/90 backdrop-blur-sm border border-line rounded-xl px-5 py-4 shadow-lg">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3 mb-2">Alcance Ghost Shopper</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="text-[12px] text-ink-2">Fuerte (≥7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="text-[12px] text-ink-2">Media (5-7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="text-[12px] text-ink-2">Baja (&lt;5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500/60" />
            <span className="text-[12px] text-ink-2">Sin audit</span>
          </div>
        </div>
      </div>

      {/* Header overlay */}
      <div className="absolute top-4 left-4 bg-bg-card/90 backdrop-blur-sm border border-line rounded-xl px-4 py-2.5 shadow-lg">
        <p className="text-[13px] font-semibold text-ink">México — Alcance del sur</p>
        <p className="text-[12px] text-ink-3">{mappedBusinesses.length} agencias monitoreadas</p>
      </div>
    </div>
  )
}
