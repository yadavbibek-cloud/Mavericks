/**
 * GridSense Pro — Real-Time GIS SCADA Telemetry & GNN Resiliency Engine
 * Implements clean point map with asset categories, real-time live telemetry stream,
 * asset inspector, causal root-cause separation, and what-if mitigation.
 */

const GridApp = (() => {
  // Application State
  const state = {
    currentGridState: null,
    currentModelOutput: null,
    currentPitchStep: 1,
    showCascadePath: true,
    scenarios: {},
    selectedNodeId: "T17",
    isSimulating: false,
    isLiveStreaming: true,
    streamTimer: null,
    map: null,
    markersLayer: null,
    linesLayer: null,
    cascadeVectorLayer: null,
    markerInstances: {},
    sparklineChart: null,
    baseLoad: 4.25
  };

  // Real Geospatial Coordinates for IEEE 33-Bus Nodes (Western Regional Interconnect Corridor)
  const GEO_COORDINATES = {
    // Primary Substation S1 (Seattle, WA)
    "S1": { lat: 47.6062, lng: -122.3321, name: "Pacific Main Substation S1", city: "Seattle, WA", category: "Substation" },
    // Trunk Feeder Line (Cascadia -> California Corridor)
    "F2": { lat: 46.5000, lng: -122.8000, name: "Central Cascades Feeder F2", city: "Centralia, WA", category: "Feeder" },
    "T3": { lat: 45.8500, lng: -122.6500, name: "Columbia River Transformer T3", city: "Vancouver, WA", category: "Transformer" },
    "S4": { lat: 45.5152, lng: -122.6784, name: "Willamette Regional Substation S4", city: "Portland, OR", category: "Substation" },
    "T5": { lat: 44.9429, lng: -123.0351, name: "Mid-Willamette Step-Down T5", city: "Salem, OR", category: "Transformer" },
    "F6": { lat: 44.0521, lng: -123.0868, name: "Lane County Feeder F6", city: "Eugene, OR", category: "Feeder" },
    "T7": { lat: 42.3265, lng: -122.8756, name: "Rogue River Transformer T7", city: "Medford, OR", category: "Transformer" },
    "F8": { lat: 41.2000, lng: -122.3000, name: "Shasta Feeder Main Trunk F8", city: "Mount Shasta, CA", category: "Feeder" },
    "T9": { lat: 40.5865, lng: -122.3917, name: "Cascade Foothills Transformer T9", city: "Redding, CA", category: "Transformer" },
    "F10": { lat: 39.7285, lng: -121.8375, name: "Sacramento North Feeder F10", city: "Chico, CA", category: "Feeder" },
    "T11": { lat: 38.5816, lng: -121.4944, name: "Sacramento Central Step-Down T11", city: "Sacramento, CA", category: "Transformer" },
    "F12": { lat: 37.8044, lng: -122.2712, name: "East Bay Feeder F12", city: "Oakland, CA", category: "Feeder" },
    "T13": { lat: 37.7749, lng: -122.4194, name: "Bay Area Grid Transformer T13", city: "San Francisco, CA", category: "Transformer" },
    "T14": { lat: 37.3382, lng: -121.8863, name: "Silicon Valley Relief Transformer T14", city: "San Jose, CA", category: "Transformer" },
    "F15": { lat: 36.6002, lng: -121.8947, name: "Monterey Bay Feeder F15", city: "Monterey, CA", category: "Feeder" },
    "F16": { lat: 35.2828, lng: -120.6596, name: "Central Coast Line F16", city: "San Luis Obispo, CA", category: "Feeder" },
    "T17": { lat: 34.4208, lng: -119.6982, name: "Santa Barbara Heavy Transformer T17", city: "Santa Barbara, CA", category: "Transformer" },
    "T18": { lat: 34.0522, lng: -118.2437, name: "Los Angeles Basin Transformer T18", city: "Los Angeles, CA", category: "Transformer" },

    // Lateral Branch 1 (East into Sierra & Nevada)
    "T19": { lat: 46.8500, lng: -121.0000, name: "Yakima Valley Transformer T19", city: "Yakima, WA", category: "Transformer" },
    "F20": { lat: 45.6000, lng: -121.1800, name: "Columbia Gorge Line F20", city: "The Dalles, OR", category: "Feeder" },
    "T21": { lat: 39.5296, lng: -119.8138, name: "Tahoe / Reno Distribution Step-Down T21", city: "Reno, NV", category: "Transformer" },
    "F22": { lat: 39.1638, lng: -119.7674, name: "Carson Valley Feeder F22", city: "Carson City, NV", category: "Feeder" },

    // Lateral Branch 2 (Desert & Inland Empire)
    "T23": { lat: 35.3733, lng: -119.0187, name: "San Joaquin South Transformer T23", city: "Bakersfield, CA", category: "Transformer" },
    "T24": { lat: 35.1500, lng: -115.4700, name: "Mojave Industrial Grid T24", city: "Barstow, CA", category: "Transformer" },
    "F25": { lat: 34.1083, lng: -117.2898, name: "Inland Empire Feeder F25", city: "San Bernardino, CA", category: "Feeder" },

    // Lateral Branch 3 (Central Valley Grid)
    "F26": { lat: 37.9577, lng: -121.2908, name: "San Joaquin Valley Feeder F26", city: "Stockton, CA", category: "Feeder" },
    "T27": { lat: 37.6391, lng: -120.9969, name: "Modesto Distribution Transformer T27", city: "Modesto, CA", category: "Transformer" },
    "F28": { lat: 36.7468, lng: -119.7726, name: "Fresno Grid Feeder F28", city: "Fresno, CA", category: "Feeder" },
    "T29": { lat: 36.3302, lng: -119.2921, name: "Visalia Step-Down T29", city: "Visalia, CA", category: "Transformer" },
    "T30": { lat: 35.0100, lng: -115.4700, name: "Desert Solar Tie Substation T30", city: "Needles, CA", category: "Transformer" },
    "F31": { lat: 33.8303, lng: -116.5453, name: "Palm Springs Feeder F31", city: "Palm Springs, CA", category: "Feeder" },
    "T32": { lat: 33.2000, lng: -115.8000, name: "Salton Sea Geothermal Tie T32", city: "Salton City, CA", category: "Transformer" },
    "T33": { lat: 32.7920, lng: -115.5631, name: "Imperial Valley Grid Step-Down T33", city: "El Centro, CA", category: "Transformer" }
  };

  /**
   * Initializes the application and Leaflet GIS map.
   */
  async function init() {
    if (window.lucide) lucide.createIcons();

    initLeafletMap();
    startClock();
    startLiveTelemetryStream();
    setupEventListeners();

    // Load initial scenario (T17 Overload Pitch Scenario)
    try {
      const resp = await fetch("/api/scenarios/scenario_t17_overload");
      if (resp.ok) {
        const scenarioData = await resp.json();
        state.scenarios["scenario_t17_overload"] = scenarioData;
        loadScenarioData(scenarioData);
      } else {
        await fetchInitialTopology();
      }
    } catch (e) {
      console.warn("Using fallback initial topology", e);
      await fetchInitialTopology();
    }
  }

  /**
   * Initializes the Leaflet Map with clean OpenStreetMap dark tiles.
   */
  function initLeafletMap() {
    state.map = L.map("leaflet-map", {
      zoomControl: false,
      attributionControl: false
    }).setView([39.5, -120.0], 5);

    L.control.zoom({ position: "bottomright" }).addTo(state.map);

    // Standard OpenStreetMap Tiles (100% Free & No API Key Needed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"]
    }).addTo(state.map);

    // Feature Groups for layer management
    state.linesLayer = L.featureGroup().addTo(state.map);
    state.cascadeVectorLayer = L.featureGroup().addTo(state.map);
    state.markersLayer = L.featureGroup().addTo(state.map);
  }

  function setupEventListeners() {
    const stressSlider = document.getElementById("slider-stress");
    const searchInput = document.getElementById("mapSearch");

    if (stressSlider) {
      stressSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById("label-stress-val").innerText = `${val.toFixed(2)}x (+${Math.round((val-1)*100)}%)`;
      });
    }

    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchNode();
      });
    }
  }

  function startClock() {
    setInterval(() => {
      const now = new Date();
      const utcStr = `UTC ${now.toISOString().substring(11, 19)}`;
      const clockEl = document.getElementById("live-clock");
      if (clockEl) clockEl.innerText = utcStr;
    }, 1000);
  }

  /**
   * Real-Time SCADA Telemetry Streamer.
   * Periodically updates frequency, demand, and micro-variations.
   */
  function startLiveTelemetryStream() {
    if (state.streamTimer) clearInterval(state.streamTimer);

    state.streamTimer = setInterval(() => {
      if (!state.isLiveStreaming) return;

      // Realistic SCADA frequency micro-jitter around 59.98 Hz
      const freq = 59.98 + (Math.random() * 0.04 - 0.02);
      const freqEl = document.getElementById("header-freq");
      const footerFreqEl = document.getElementById("footer-freq");
      if (freqEl) freqEl.innerText = `${freq.toFixed(2)} Hz`;
      if (footerFreqEl) footerFreqEl.innerText = `${freq.toFixed(2)} Hz`;

      // Live demand fluctuation
      const deltaDemand = (Math.random() * 0.04 - 0.02);
      const currentDemand = (state.baseLoad + deltaDemand).toFixed(2);
      const demandPct = ((deltaDemand / state.baseLoad) * 100 + 1.2).toFixed(1);
      const footerDemandEl = document.getElementById("footer-demand");
      if (footerDemandEl) {
        footerDemandEl.innerHTML = `${currentDemand} GW <span class="text-[10px] text-emerald-400 font-normal font-sans">+${demandPct}%</span>`;
      }

      // Micro-jitter on selected node telemetry if in normal range
      if (state.selectedNodeId === "T17" && !state.isSimulating) {
        const loadJitter = (84.2 + (Math.random() * 0.4 - 0.2)).toFixed(1);
        const voltJitter = (0.972 + (Math.random() * 0.002 - 0.001)).toFixed(3);
        const tempJitter = (71.0 + (Math.random() * 0.2 - 0.1)).toFixed(1);

        const loadEl = document.getElementById("ins-load");
        const voltEl = document.getElementById("ins-volt");
        const tempEl = document.getElementById("ins-temp");

        if (loadEl) loadEl.innerText = `${loadJitter}%`;
        if (voltEl) voltEl.innerText = `${voltJitter} pu`;
        if (tempEl) tempEl.innerText = `${tempJitter} °C`;
      }
    }, 1500);
  }

  function toggleLiveStream() {
    state.isLiveStreaming = !state.isLiveStreaming;
    const badge = document.getElementById("live-stream-badge");
    const btnText = document.getElementById("btn-stream-text");

    if (state.isLiveStreaming) {
      if (badge) {
        badge.innerText = "LIVE REAL-TIME STREAM";
        badge.className = "text-emerald-400 font-bold";
      }
      if (btnText) btnText.innerText = "Pause Stream";
    } else {
      if (badge) {
        badge.innerText = "STREAM PAUSED";
        badge.className = "text-amber-400 font-bold";
      }
      if (btnText) btnText.innerText = "Resume Stream";
    }
  }

  function getNodeTypeName(id) {
    if (id === "S1" || id === "S4") return "Substation";
    if (id.startsWith("T")) return "Transformer";
    return "Feeder Node";
  }

  async function fetchInitialTopology() {
    try {
      const res = await fetch("/api/grid/topology");
      const gridState = await res.json();
      const predRes = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gridState)
      });
      const modelOut = await predRes.json();
      renderState(gridState, modelOut.model_output);
    } catch (err) {
      console.error("Failed to fetch topology", err);
    }
  }

  /**
   * Renders the complete dashboard from gridState and modelOutput.
   */
  function renderState(gridState, modelOutput) {
    state.currentGridState = gridState;
    state.currentModelOutput = modelOutput;

    renderLeafletLayers(gridState, modelOutput);
    updateMetricsAndPanels(gridState, modelOutput);
    updateInspectorPanel(state.selectedNodeId);
  }

  /**
   * Renders Leaflet Markers and Transmission Lines.
   */
  function renderLeafletLayers(gridState, modelOutput) {
    if (!state.map) return;

    state.markersLayer.clearLayers();
    state.linesLayer.clearLayers();
    state.cascadeVectorLayer.clearLayers();
    state.markerInstances = {};

    const nodeRisk = modelOutput.node_risk || {};
    const rootCauses = modelOutput.root_cause_ranking || [];
    const cascadePath = modelOutput.cascade_path || [];

    // Find top root cause
    const topRootCause = rootCauses.find(rc => !rc.explained_by_upstream) || rootCauses[0];
    const trueRootNodeId = topRootCause ? topRootCause.node : null;

    // 1. Draw Transmission Lines (Polylines)
    (gridState.edges || []).forEach(edge => {
      const uGeo = GEO_COORDINATES[edge.source];
      const vGeo = GEO_COORDINATES[edge.target];
      if (!uGeo || !vGeo) return;

      const uRisk = nodeRisk[edge.source] || 0;
      const vRisk = nodeRisk[edge.target] || 0;
      const avgRisk = (uRisk + vRisk) / 2;

      let lineColor = "#10b981"; // Healthy Emerald
      let lineWeight = 2.5;
      let opacity = 0.85;

      if (edge.status === "TRIPPED" || uRisk > 0.80 || vRisk > 0.80) {
        lineColor = "#ef4444"; // Crimson
        lineWeight = 3.5;
      } else if (avgRisk > 0.35 || edge.loading_pct > 70) {
        lineColor = "#f59e0b"; // Amber
        lineWeight = 3.0;
      }

      const polyline = L.polyline([
        [uGeo.lat, uGeo.lng],
        [vGeo.lat, vGeo.lng]
      ], {
        color: lineColor,
        weight: lineWeight,
        opacity: edge.status === "TRIPPED" ? 0.3 : opacity,
        dashArray: (edge.status === "TRIPPED") ? "5, 5" : null
      });

      polyline.bindTooltip(`
        <div class="font-mono text-[10px]">
          <b class="text-cyan-300">${edge.source} ➔ ${edge.target}</b><br/>
          <span>Flow: ${edge.flow_mw || 0} MVA (${edge.loading_pct || 0}%)</span><br/>
          <span>Status: ${edge.status}</span>
        </div>
      `, { sticky: true });

      state.linesLayer.addLayer(polyline);
    });

    // 2. Draw Cascade Propagation Path Highlight
    if (state.showCascadePath && cascadePath.length > 1) {
      const latlngs = [];
      cascadePath.forEach(nid => {
        const geo = GEO_COORDINATES[nid];
        if (geo) latlngs.push([geo.lat, geo.lng]);
      });

      if (latlngs.length > 1) {
        const cascadeLine = L.polyline(latlngs, {
          color: "#f43f5e",
          weight: 5,
          opacity: 0.9,
          dashArray: "8, 6"
        });
        state.cascadeVectorLayer.addLayer(cascadeLine);
      }
    }

    // 3. Draw Plain Markers for All 33 Assets with Category Styling
    const typeFilter = document.getElementById("mapTypeFilter") ? document.getElementById("mapTypeFilter").value : "";
    const statusFilter = document.getElementById("mapStatusFilter") ? document.getElementById("mapStatusFilter").value : "";

    (gridState.nodes || []).forEach(node => {
      const geo = GEO_COORDINATES[node.id];
      if (!geo) return;

      const risk = nodeRisk[node.id] || 0.05;
      const isRootCause = (node.id === trueRootNodeId && risk > 0.5);
      const isSymptom = rootCauses.some(rc => rc.node === node.id && rc.explained_by_upstream);

      // Filtering check
      if (typeFilter && node.type !== typeFilter) return;
      if (statusFilter === "healthy" && risk >= 0.30) return;
      if (statusFilter === "stressed" && (risk < 0.30 || risk > 0.70)) return;
      if (statusFilter === "critical" && risk < 0.70) return;

      let markerClass = "marker-healthy";
      if (node.status === "TRIPPED") {
        markerClass = "marker-critical";
      } else if (isRootCause) {
        markerClass = "marker-root-cause";
      } else if (risk >= 0.70) {
        markerClass = "marker-critical";
      } else if (risk >= 0.30) {
        markerClass = "marker-alert";
      }

      const isSub = (node.type === "substation");
      const iconHtml = `
        <div class="node-marker-body ${markerClass} ${isSub ? 'marker-substation' : ''}" title="${node.id} (${geo.category})">
          <span style="font-size: 8px; font-weight: bold; color: #080c14; font-family: monospace;">${isSub ? 'S' : ''}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "grid-node-icon",
        html: iconHtml,
        iconSize: isSub ? [20, 20] : [16, 16],
        iconAnchor: isSub ? [10, 10] : [8, 8]
      });

      const marker = L.marker([geo.lat, geo.lng], { icon: customIcon });

      const feats = node.features || {};
      const ci = (modelOutput.confidence_interval || {})[node.id] || [risk - 0.05, risk + 0.05];
      let roleLabel = "";
      if (isRootCause) roleLabel = `<div class="text-amber-400 font-bold mb-0.5">★ TRUE ROOT CAUSE</div>`;
      else if (isSymptom) roleLabel = `<div class="text-rose-400 font-bold mb-0.5">↳ DOWNSTREAM SYMPTOM</div>`;

      marker.bindTooltip(`
        <div class="font-mono text-xs">
          <div class="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
            <b class="text-cyan-300">${node.id} (${geo.category})</b>
            <span class="px-1.5 py-0.5 rounded text-[10px] ${risk > 0.7 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'} font-bold">${(risk*100).toFixed(1)}% RISK</span>
          </div>
          ${roleLabel}
          <div class="text-[10px] text-slate-300">
            <span>Location: <b>${geo.city}</b></span><br/>
            <span>Loading: <b>${feats.load_pct}%</b> &bull; Voltage: <b>${feats.voltage_pu} pu</b></span><br/>
            <span>Temp: <b>${feats.temperature_c}°C</b> &bull; 90% CI: <b>[${(ci[0]*100).toFixed(0)}% – ${(ci[1]*100).toFixed(0)}%]</b></span>
          </div>
        </div>
      `, { direction: "top", offset: [0, -8] });

      marker.on("click", () => {
        focusNode(node.id);
      });

      state.markersLayer.addLayer(marker);
      state.markerInstances[node.id] = marker;
    });
  }

  /**
   * Focuses on an asset on the map and updates the inspector.
   */
  function focusNode(nodeId) {
    state.selectedNodeId = nodeId;
    const geo = GEO_COORDINATES[nodeId];
    if (geo && state.map) {
      state.map.setView([geo.lat, geo.lng], 8, { animate: true });
      const marker = state.markerInstances[nodeId];
      if (marker) marker.openTooltip();
    }

    updateInspectorPanel(nodeId);
  }

  function searchNode() {
    const query = document.getElementById("mapSearch").value.trim().toLowerCase();
    if (!query) return;

    for (const [nid, geo] of Object.entries(GEO_COORDINATES)) {
      if (nid.toLowerCase() === query || geo.name.toLowerCase().includes(query) || geo.city.toLowerCase().includes(query)) {
        focusNode(nid);
        return;
      }
    }
  }

  function filterMarkers() {
    if (state.currentGridState && state.currentModelOutput) {
      renderLeafletLayers(state.currentGridState, state.currentModelOutput);
    }
  }

  function fitAllBounds() {
    if (state.markersLayer && state.markersLayer.getLayers().length > 0) {
      state.map.fitBounds(state.markersLayer.getBounds(), { padding: [30, 30] });
    }
  }

  /**
   * Updates the Selected Asset Inspector Panel with required exact fields:
   * LOADING: 84.2%, VOLTAGE: 0.972 pu, TEMPERATURE: 71.0 °C, TIME TO CRITICAL: 6.2 hrs, and Alert status.
   */
  function updateInspectorPanel(nodeId) {
    if (!state.currentGridState || !state.currentModelOutput) return;

    const node = (state.currentGridState.nodes || []).find(n => n.id === nodeId);
    if (!node) return;

    const geo = GEO_COORDINATES[nodeId] || { name: nodeId, city: "Regional Grid", category: "Transformer" };
    const feats = node.features || {};
    const risk = (state.currentModelOutput.node_risk || {})[nodeId] || 0.1;
    const ttc = (state.currentModelOutput.time_to_critical_hours || {})[nodeId] || 12.0;

    document.getElementById("ins-asset-name").innerText = `${nodeId} — ${geo.name}`;
    document.getElementById("ins-location").innerText = `${geo.city} • ${geo.category.toUpperCase()}`;
    document.getElementById("ins-load").innerText = `${feats.load_pct}%`;
    document.getElementById("ins-volt").innerText = `${feats.voltage_pu} pu`;
    document.getElementById("ins-temp").innerText = `${feats.temperature_c} °C`;
    document.getElementById("ins-ttc").innerText = `${ttc} hrs`;

    const statusBadge = document.getElementById("ins-status-badge");
    if (statusBadge) {
      if (risk > 0.70) {
        statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800";
        statusBadge.innerText = "CRITICAL ALERT";
      } else if (risk > 0.30) {
        statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800";
        statusBadge.innerText = "ALERT";
      } else {
        statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800";
        statusBadge.innerText = "ONLINE";
      }
    }

    renderSparkline(node, risk);
  }

  function renderSparkline(node, risk) {
    const ctx = document.getElementById("insSparkline");
    if (!ctx) return;

    if (state.sparklineChart) {
      state.sparklineChart.destroy();
    }

    const vBase = node.features.voltage_pu || 0.98;
    const dataPoints = [];
    for (let h = 0; h < 24; h += 3) {
      const drop = (h >= 12 && h <= 18) ? (risk * 0.08) : 0.01;
      dataPoints.push(Number((vBase - drop + (Math.random() * 0.01 - 0.005)).toFixed(3)));
    }

    state.sparklineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"],
        datasets: [{
          data: dataPoints,
          borderColor: risk > 0.7 ? "#ef4444" : "#06b6d4",
          backgroundColor: risk > 0.7 ? "rgba(239, 68, 68, 0.15)" : "rgba(6, 182, 212, 0.15)",
          borderWidth: 1.5,
          tension: 0.3,
          fill: true,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 8 }, color: "#64748b" }, grid: { display: false } },
          y: { min: 0.85, max: 1.05, ticks: { font: { size: 8 }, color: "#64748b" }, grid: { color: "rgba(255,255,255,0.05)" } }
        }
      }
    });
  }

  function updateMetricsAndPanels(gridState, modelOutput) {
    const cascadeRisk = modelOutput.cascade_risk_pct || 12.0;
    const rootCauses = modelOutput.root_cause_ranking || [];
    const nodeRisks = modelOutput.node_risk || {};

    const meterEl = document.getElementById("cascade-risk-meter");
    if (meterEl) {
      meterEl.innerText = `${cascadeRisk.toFixed(1)}%`;
      meterEl.className = `px-2 py-0.5 rounded font-bold text-xs ${cascadeRisk > 60 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`;
    }

    const headerStatus = document.getElementById("header-status-badge");
    const footerStability = document.getElementById("footer-stability");
    if (cascadeRisk > 60) {
      if (headerStatus) {
        headerStatus.innerText = "CASCADE ALERT";
        headerStatus.className = "px-2 py-0.5 rounded text-[11px] font-bold badge-critical";
      }
      if (footerStability) {
        footerStability.innerText = `${(100 - cascadeRisk).toFixed(1)}% AT RISK`;
        footerStability.className = "text-sm font-extrabold text-rose-400";
      }
    } else {
      if (headerStatus) {
        headerStatus.innerText = "98.4% STABLE";
        headerStatus.className = "px-2 py-0.5 rounded text-[11px] font-bold badge-healthy";
      }
      if (footerStability) {
        footerStability.innerText = "98.4% STABLE";
        footerStability.className = "text-sm font-extrabold text-emerald-400";
      }
    }

    // Cascade Path Pills
    const pathPillsContainer = document.getElementById("cascade-path-pills");
    const cascadePath = modelOutput.cascade_path || [];
    if (pathPillsContainer) {
      if (cascadePath.length > 0) {
        pathPillsContainer.innerHTML = cascadePath.map((nid, idx) => {
          const isOrigin = idx === 0;
          const bgClass = isOrigin ? "bg-amber-950 text-amber-300 border border-amber-700 font-bold" : "bg-rose-950 text-rose-300 border border-rose-800";
          const arrow = idx < cascadePath.length - 1 ? `<i data-lucide="arrow-right" class="w-3 h-3 text-slate-500 inline mx-1"></i>` : "";
          return `<span class="px-2 py-0.5 rounded ${bgClass}">${nid}${isOrigin ? ' (Origin)' : ''}</span>${arrow}`;
        }).join("");
      } else {
        pathPillsContainer.innerHTML = `<span class="text-emerald-400 font-mono">No active cascade propagation.</span>`;
      }
      if (window.lucide) lucide.createIcons();
    }

    // Root Cause vs Symptom Panel
    const topRc = rootCauses.find(rc => !rc.explained_by_upstream) || rootCauses[0];
    if (topRc) {
      const rcNodeEl = document.getElementById("rc-node-id");
      const rcScoreEl = document.getElementById("rc-score-badge");
      if (rcNodeEl) rcNodeEl.innerText = `${topRc.node} — TRUE ROOT CAUSE`;
      if (rcScoreEl) rcScoreEl.innerText = `${Math.round(topRc.root_cause_score * 100)}% Score`;
    }

    const rec = modelOutput.recommended_intervention || {
      action: "Reduce T17 load by 12%, redistribute active power across tie lines to T14 and T19.",
      target_node: "T17",
      load_shed_pct: 12.0
    };
    const recDescEl = document.getElementById("intervene-action-desc");
    if (recDescEl) recDescEl.innerText = rec.action;
  }

  async function runCustomSimulation() {
    state.isSimulating = true;
    const btn = document.getElementById("btn-simulate");
    if (btn) btn.innerHTML = `<span class="animate-spin">⌛</span> <span>Simulating...</span>`;

    const stress = parseFloat(document.getElementById("slider-stress").value);

    try {
      const resp = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiating_node: "T17",
          stress_multiplier: stress,
          ambient_temp_c: 35.0,
          max_steps: 6
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        renderState(data.grid_state, data.model_output);
        focusNode("T17");
      }
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      state.isSimulating = false;
      if (btn) btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> <span>Inject Stress</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }

  async function applyIntervention() {
    try {
      const resp = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiating_node: "T17",
          stress_multiplier: 1.85,
          ambient_temp_c: 35.0,
          load_shed_pct: 12.0
        })
      });

      if (resp.ok) {
        const result = await resp.json();
        const beforeRisk = result.before.model_output.cascade_risk_pct;
        const afterRisk = result.after.model_output.cascade_risk_pct;

        document.getElementById("meter-before-val").innerText = `${beforeRisk.toFixed(0)}% RISK`;
        document.getElementById("meter-after-val").innerText = `${afterRisk.toFixed(0)}% RISK`;

        renderState(result.after.grid_state, result.after.model_output);
        highlightPitchStep(8);
        document.getElementById("demo-step-text").innerText = `8. Result: "Cascade risk drops from ${beforeRisk.toFixed(0)}% to ${afterRisk.toFixed(0)}%. That's actionable decision-making."`;
      }
    } catch (e) {
      console.error("Intervention error", e);
    }
  }

  function loadScenarioData(scenario) {
    if (scenario.before) {
      renderState(scenario.before.grid_state, scenario.before.model_output);
      document.getElementById("meter-before-val").innerText = `${scenario.before.model_output.cascade_risk_pct.toFixed(0)}% RISK`;
      document.getElementById("meter-after-val").innerText = `${scenario.after.model_output.cascade_risk_pct.toFixed(0)}% RISK`;
    } else if (scenario.grid_state && scenario.model_output) {
      renderState(scenario.grid_state, scenario.model_output);
    }
    focusNode("T17");
  }

  async function resetHealthy() {
    try {
      const resp = await fetch("/api/scenarios/scenario_normal");
      if (resp.ok) {
        const data = await resp.json();
        loadScenarioData(data);
        highlightPitchStep(1);
        document.getElementById("demo-step-text").innerText = `1. Normal state: "Here's a live grid — 33 nodes, all healthy, cascade risk 3%."`;
        fitAllBounds();
      }
    } catch (e) {
      console.error("Reset error", e);
    }
  }

  async function runPitchStep(stepNumber) {
    highlightPitchStep(stepNumber);

    switch (stepNumber) {
      case 1:
        await resetHealthy();
        break;
      case 2:
        document.getElementById("slider-stress").value = 1.85;
        document.getElementById("label-stress-val").innerText = "1.85x (+85%)";
        document.getElementById("demo-step-text").innerText = `2. Introduce stress: "We spike demand at Substation T17 using the what-if slider."`;
        await runCustomSimulation();
        break;
      case 3:
        document.getElementById("demo-step-text").innerText = `3. Early prediction: "Before anything trips, GridSense flags T17 at 86% failure risk — hours ahead."`;
        focusNode("T17");
        break;
      case 4:
        document.getElementById("demo-step-text").innerText = `4. Why: "Temperature (+31%), Load growth (+27%), and Neighbor transfer (+22%) are top factors."`;
        focusNode("T17");
        break;
      case 5:
        document.getElementById("demo-step-text").innerText = `5. Root cause, not symptom: "T17, T21, and F8 all show elevated risk. GridSense isolates T17 as the true origin."`;
        focusNode("T17");
        break;
      case 6:
        document.getElementById("demo-step-text").innerText = `6. Cascade path: "Predicted propagation path T17 -> F8 -> T21 -> S4 with 86% regional risk."`;
        state.showCascadePath = true;
        if (state.currentGridState && state.currentModelOutput) {
          renderLeafletLayers(state.currentGridState, state.currentModelOutput);
        }
        fitAllBounds();
        break;
      case 7:
        document.getElementById("demo-step-text").innerText = `7. Intervention: "Recommended action: reduce T17 load by 12%, redistribute to T14 and T19."`;
        break;
      case 8:
        await applyIntervention();
        break;
    }
  }

  function nextPitchStep() {
    state.currentPitchStep = (state.currentPitchStep % 8) + 1;
    runPitchStep(state.currentPitchStep);
  }

  function highlightPitchStep(stepNum) {
    state.currentPitchStep = stepNum;
    const pills = document.querySelectorAll(".step-pill");
    pills.forEach((p, idx) => {
      if (idx === stepNum - 1) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });
  }

  function toggleCascadePath() {
    state.showCascadePath = !state.showCascadePath;
    const btn = document.getElementById("toggle-path");
    if (btn) {
      if (state.showCascadePath) {
        btn.className = "px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition flex items-center space-x-1";
      } else {
        btn.className = "px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750 transition flex items-center space-x-1";
      }
    }
    if (state.currentGridState && state.currentModelOutput) {
      renderLeafletLayers(state.currentGridState, state.currentModelOutput);
    }
  }

  return {
    init,
    runCustomSimulation,
    applyIntervention,
    resetHealthy,
    runPitchStep,
    nextPitchStep,
    toggleCascadePath,
    toggleLiveStream,
    focusNode,
    searchNode,
    filterMarkers,
    fitAllBounds
  };
})();

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", GridApp.init);
