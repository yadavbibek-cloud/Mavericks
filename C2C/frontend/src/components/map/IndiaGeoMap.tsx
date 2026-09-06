import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GridNode,
  GridEdge,
  ModelOutput,
  VerifiedSubstation
} from '../../types/schema';
import {
  ShieldAlert,
  Key,
  Info,
  AlertTriangle
} from 'lucide-react';

interface IndiaGeoMapProps {
  nodes: GridNode[];
  edges: GridEdge[];
  modelOutput: ModelOutput | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  cascadeStep?: number;
  isPlayingCascade?: boolean;
  verifiedSubstations?: VerifiedSubstation[];
}

export const IndiaGeoMap: React.FC<IndiaGeoMapProps> = ({
  nodes,
  edges,
  modelOutput,
  selectedNodeId,
  onSelectNode,
  verifiedSubstations = []
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gridsense_google_maps_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showVerified, setShowVerified] = useState(true);
  const [showBackbone, setShowBackbone] = useState(true);
  const [activeTab, setActiveTab] = useState<'interactive' | 'gmaps'>('interactive');
  const [selectedVerifiedSub, setSelectedVerifiedSub] = useState<VerifiedSubstation | null>(null);

  const googleMapRef = useRef<HTMLDivElement>(null);
  const gmapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  // Bounding box of India for SVG projection
  // Lat: 8.0 (South) to 34.0 (North)
  // Lon: 68.0 (West) to 92.0 (East)
  const projectCoordinates = useCallback((lat: number, lon: number, width: number, height: number) => {
    const minLat = 7.5;
    const maxLat = 33.5;
    const minLon = 68.0;
    const maxLon = 91.5;

    const x = ((lon - minLon) / (maxLon - minLon)) * (width * 0.82) + (width * 0.09);
    const y = ((maxLat - lat) / (maxLat - minLat)) * (height * 0.84) + (height * 0.08);
    return { x, y };
  }, []);

  const getRiskColor = (nodeId: string) => {
    const risk = modelOutput?.node_risk?.[nodeId] ?? 0.15;
    if (risk < 0.20) return '#10b981'; // Emerald
    if (risk < 0.50) return '#f59e0b'; // Amber
    if (risk < 0.75) return '#f97316'; // Orange
    return '#ef4444'; // Crimson
  };

  // Handle Google Maps API Loading if key is present
  useEffect(() => {
    if (!apiKey || activeTab !== 'gmaps' || !googleMapRef.current) return;

    // Check if script already exists
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initMap = () => {
      if (!(window as any).google?.maps) return;
      const g = (window as any).google.maps;

      const map = new g.Map(googleMapRef.current, {
        center: { lat: 21.5, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapTypeId: 'roadmap',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#172033' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050811' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1e293b' }] }
        ],
        disableDefaultUI: false,
        zoomControl: true
      });

      gmapInstanceRef.current = map;

      // Clear previous markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];

      // Add Grid Nodes
      nodes.forEach((n) => {
        if (!n.lat || !n.lon) return;
        const color = getRiskColor(n.id);
        const marker = new g.Marker({
          position: { lat: n.lat, lng: n.lon },
          map: map,
          title: `${n.id} (${n.city || ''})`,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: n.id === selectedNodeId ? 10 : 7,
            fillColor: color,
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        marker.addListener('click', () => {
          onSelectNode(n.id);
        });

        markersRef.current.push(marker);
      });

      // Add Verified Substations
      if (showVerified) {
        verifiedSubstations.forEach((sub) => {
          const marker = new g.Marker({
            position: { lat: sub.lat, lng: sub.lon },
            map: map,
            title: `[VERIFIED] ${sub.name} - ${sub.voltage_level_kv}kV`,
            icon: {
              path: g.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: '#fbbf24',
              fillOpacity: 0.95,
              strokeWeight: 1.5,
              strokeColor: '#000000'
            }
          });

          marker.addListener('click', () => {
            setSelectedVerifiedSub(sub);
          });

          markersRef.current.push(marker);
        });
      }

      // Add Transmission Edges
      if (showBackbone) {
        edges.forEach((edge) => {
          const srcNode = nodes.find((n) => n.id === edge.source);
          const tgtNode = nodes.find((n) => n.id === edge.target);
          if (srcNode?.lat && srcNode?.lon && tgtNode?.lat && tgtNode?.lon) {
            const isBackbone = edge.type === 'line' || edge.capacity_mva > 200;
            const line = new g.Polyline({
              path: [
                { lat: srcNode.lat, lng: srcNode.lon },
                { lat: tgtNode.lat, lng: tgtNode.lon }
              ],
              geodesic: true,
              strokeColor: isBackbone ? '#38bdf8' : '#64748b',
              strokeOpacity: 0.75,
              strokeWeight: isBackbone ? 3 : 1.5,
              map: map
            });
            polylinesRef.current.push(line);
          }
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGridSenseMap`;
      script.async = true;
      script.defer = true;
      (window as any).initGridSenseMap = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [apiKey, activeTab, nodes, edges, selectedNodeId, showVerified, showBackbone, onSelectNode, verifiedSubstations]);

  const handleSaveApiKey = () => {
    localStorage.setItem('gridsense_google_maps_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setIsKeyModalOpen(false);
    if (keyInput.trim()) {
      setActiveTab('gmaps');
    }
  };

  // Group nodes by city for clean overview
  const cityGroups = nodes.reduce((acc, n) => {
    const c = n.city || 'Other';
    if (!acc[c]) acc[c] = [];
    acc[c].push(n);
    return acc;
  }, {} as Record<string, GridNode[]>);

  return (
    <div className="w-full h-full relative bg-[#070b14] overflow-hidden flex flex-col font-mono select-none">
      {/* ── Top Floating Toolbar ───────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Map Mode & Filters */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg shadow-xl">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1 text-xs rounded font-semibold transition-all ${
              activeTab === 'interactive'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Twin Grid Map
          </button>
          <button
            onClick={() => {
              if (!apiKey) {
                setIsKeyModalOpen(true);
              } else {
                setActiveTab('gmaps');
              }
            }}
            className={`px-3 py-1 text-xs rounded font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'gmaps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>Google Maps {apiKey ? '(Active)' : '(Enter Key)'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setShowBackbone((v) => !v)}
            className={`px-2.5 py-1 text-[11px] rounded transition-all ${
              showBackbone
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Backbone Lines
          </button>

          <button
            onClick={() => setShowVerified((v) => !v)}
            className={`px-2.5 py-1 text-[11px] rounded flex items-center gap-1 transition-all ${
              showVerified
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Verified DTL/KSEB Pins</span>
          </button>
        </div>

        {/* Right: Disclaimer Badge */}
        <div className="pointer-events-auto bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-amber-300 backdrop-blur-md shadow-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-mono">
            India Synthetic Demo Grid (Seed 42) + Verified DTL/KSEB References
          </span>
        </div>
      </div>

      {/* ── Main Map Canvas View ───────────────────────────────────── */}
      <div className="flex-1 relative w-full h-full">
        {/* Tab 1: Built-in Interactive Digital Twin Geospatial Canvas */}
        {activeTab === 'interactive' && (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Background Map Grid Graphics */}
            <svg
              className="w-full h-full absolute inset-0 pointer-events-auto"
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
                </radialGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Central Background Ambient Glow */}
              <circle cx="500" cy="400" r="450" fill="url(#gridGlow)" />

              {/* Subtle Coordinate Grid Lines for Control-Room Look */}
              {[150, 300, 450, 600, 750].map((gx) => (
                <line
                  key={`gx-${gx}`}
                  x1={gx}
                  y1={0}
                  x2={gx}
                  y2={800}
                  stroke="#172033"
                  strokeWidth="0.75"
                  strokeDasharray="4 8"
                />
              ))}
              {[150, 300, 450, 600, 750].map((gy) => (
                <line
                  key={`gy-${gy}`}
                  x1={0}
                  y1={gy}
                  x2={1000}
                  y2={gy}
                  stroke="#172033"
                  strokeWidth="0.75"
                  strokeDasharray="4 8"
                />
              ))}

              {/* India Coastline / Border Silhouette approximation */}
              <path
                d="M 400 120 L 460 140 L 520 180 L 570 230 L 610 320 L 580 430 L 520 540 L 470 650 L 450 710 L 430 680 L 370 550 L 340 430 L 310 320 L 330 220 L 380 150 Z"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.45"
              />

              {/* ── Transmission Edges ── */}
              {showBackbone &&
                edges.map((edge) => {
                  const srcNode = nodes.find((n) => n.id === edge.source);
                  const tgtNode = nodes.find((n) => n.id === edge.target);
                  if (!srcNode?.lat || !srcNode?.lon || !tgtNode?.lat || !tgtNode?.lon)
                    return null;

                  const p1 = projectCoordinates(srcNode.lat, srcNode.lon, 1000, 800);
                  const p2 = projectCoordinates(tgtNode.lat, tgtNode.lon, 1000, 800);

                  const isHighCapacity = edge.capacity_mva >= 300;
                  const isCascadeActive =
                    modelOutput?.cascade_path?.includes(edge.source) &&
                    modelOutput?.cascade_path?.includes(edge.target);

                  return (
                    <g key={edge.id}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={
                          isCascadeActive
                            ? '#ef4444'
                            : isHighCapacity
                            ? '#06b6d4'
                            : '#334155'
                        }
                        strokeWidth={isCascadeActive ? 3.5 : isHighCapacity ? 2.5 : 1.2}
                        strokeDasharray={isCascadeActive ? '6 4' : undefined}
                        className={isCascadeActive ? 'animate-pulse' : undefined}
                        opacity={isHighCapacity ? 0.85 : 0.55}
                      />
                    </g>
                  );
                })}

              {/* ── Verified Substations Pins ── */}
              {showVerified &&
                verifiedSubstations.map((sub, idx) => {
                  const p = projectCoordinates(sub.lat, sub.lon, 1000, 800);
                  return (
                    <g
                      key={`ver-${idx}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedVerifiedSub(sub)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={6}
                        fill="#fbbf24"
                        fillOpacity={0.8}
                        stroke="#000000"
                        strokeWidth={1.5}
                      />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={12}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={0.75}
                        strokeDasharray="2 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                      />
                    </g>
                  );
                })}

              {/* ── Grid Nodes ── */}
              {nodes.map((node) => {
                if (!node.lat || !node.lon) return null;
                const p = projectCoordinates(node.lat, node.lon, 1000, 800);
                const color = getRiskColor(node.id);
                const isSelected = node.id === selectedNodeId;
                const isRootCause =
                  modelOutput?.root_cause_ranking?.[0]?.node === node.id;
                const risk = modelOutput?.node_risk?.[node.id] ?? 0.15;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => onSelectNode(node.id)}
                  >
                    {/* Pulsing ring for critical / root cause */}
                    {(risk > 0.75 || isRootCause) && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 22 : 16}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        className="animate-ping opacity-60"
                        style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                      />
                    )}

                    {/* Outer Selection Glow */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={14}
                        fill={color}
                        fillOpacity={0.25}
                        stroke={color}
                        strokeWidth={2}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 8 : 6}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      filter="url(#glow)"
                    />

                    {/* Node Label */}
                    <text
                      x={p.x + 10}
                      y={p.y + 4}
                      fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none tracking-wider drop-shadow"
                    >
                      {node.id}
                      <tspan fill="#64748b" fontSize="8" dx="4">
                        ({node.city})
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Overlay Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-lg backdrop-blur-md text-xs space-y-2 max-w-sm">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Regional Hubs & Corridors
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {Object.keys(cityGroups).map((c) => (
                  <div key={c} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;20%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 20-50%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400" /> 50-75%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> &gt;75%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Google Maps Web View */}
        {activeTab === 'gmaps' && (
          <div className="w-full h-full relative">
            <div ref={googleMapRef} className="w-full h-full" />
            {!apiKey && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm z-30">
                <Key className="w-10 h-10 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  Google Maps API Key Required
                </h3>
                <p className="text-xs text-slate-400 max-w-md text-center mb-4">
                  Enter your Google Maps Platform API key to render the live vector satellite and road map of India with custom control-room styling.
                </p>
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
                >
                  Configure API Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Selected Verified Substation Card Popup ───────────────── */}
        {selectedVerifiedSub && (
          <div className="absolute top-20 right-4 z-30 w-80 bg-slate-900/95 border border-amber-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                  Verified Utility Record
                </span>
              </div>
              <button
                onClick={() => setSelectedVerifiedSub(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <h4 className="font-bold text-sm text-slate-100 mb-0.5">
              {selectedVerifiedSub.name}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {selectedVerifiedSub.city}, {selectedVerifiedSub.state}
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Voltage Class:</span>
                <span className="text-cyan-300 font-mono">
                  {selectedVerifiedSub.voltage_level_kv} kV
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Capacity:</span>
                <span className="text-slate-200 font-mono">
                  {selectedVerifiedSub.capacity_mva} MVA
                </span>
              </div>
              {selectedVerifiedSub.notes && (
                <div className="py-1 border-b border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-0.5">
                    Operational Notes:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    {selectedVerifiedSub.notes}
                  </p>
                </div>
              )}
              <div className="pt-2">
                <span className="text-slate-400 block text-[10px] mb-0.5">
                  Verified Source:
                </span>
                <p className="text-[10px] text-amber-300/90 italic">
                  {selectedVerifiedSub.source}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Google Maps API Key Modal ───────────────────────────────── */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Google Maps Platform API Key
                </h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide your Google Maps JavaScript API key to display the live geospatial map with satellite tiles and custom dark electrical grid overlays.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 block">API Key:</label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Prototyping Note</span>
              </div>
              <p>
                Keys are stored in your browser's local storage. You can also use the default high-performance vector Digital Twin map without an external key.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded transition-all"
              >
                Save & Load Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
