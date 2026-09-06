import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GridNode, GridEdge, ModelOutput } from '../../types/schema';

interface Grid3DCanvasProps {
  nodes: GridNode[];
  edges: GridEdge[];
  modelOutput: ModelOutput | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  cascadeStep: number;
  isPlayingCascade: boolean;
}

export const Grid3DCanvas: React.FC<Grid3DCanvasProps> = ({
  nodes,
  edges,
  modelOutput,
  selectedNodeId,
  onSelectNode,
  cascadeStep
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const edgeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const particleGroupRef = useRef<THREE.Group | null>(null);

  const [hoveredNode, setHoveredNode] = useState<{
    node: GridNode;
    x: number;
    y: number;
  } | null>(null);

  // Helper to compute node risk color
  const getRiskColor = useCallback((risk: number): THREE.Color => {
    if (risk < 0.20) return new THREE.Color(0x10b981); // Healthy emerald
    if (risk < 0.50) return new THREE.Color(0xf59e0b); // Watch amber
    if (risk < 0.75) return new THREE.Color(0xf97316); // High orange
    return new THREE.Color(0xef4444); // Critical crimson
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.8);
    dirLight2.position.set(-15, 20, -15);
    scene.add(dirLight2);

    // Subtle Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1e2942);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Particle Group
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    particleGroupRef.current = particleGroup;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Animate pulsing glow on high risk nodes
      nodeMeshesRef.current.forEach((group, nodeId) => {
        const risk = modelOutput?.node_risk[nodeId] ?? 0.05;
        if (risk >= 0.70) {
          const scale = 1.0 + Math.sin(elapsedTime * 6) * 0.12;
          group.scale.set(scale, scale, scale);
        } else {
          group.scale.set(1, 1, 1);
        }
      });

      // Animate flow particles along lines
      if (particleGroupRef.current) {
        particleGroupRef.current.children.forEach((p: any) => {
          if (p.userData && p.userData.curve) {
            p.userData.progress = (p.userData.progress + p.userData.speed) % 1.0;
            const pos = p.userData.curve.getPointAt(p.userData.progress);
            p.position.copy(pos);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Meshes when nodes or edges change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old node groups
    nodeMeshesRef.current.forEach(group => scene.remove(group));
    nodeMeshesRef.current.clear();

    // Clear old edge meshes
    edgeMeshesRef.current.forEach(mesh => scene.remove(mesh));
    edgeMeshesRef.current.clear();

    // Clear old particles
    if (particleGroupRef.current) {
      while (particleGroupRef.current.children.length > 0) {
        particleGroupRef.current.remove(particleGroupRef.current.children[0]);
      }
    }

    const nodePositions = new Map<string, THREE.Vector3>();

    // 1. Create 3D Nodes
    nodes.forEach(node => {
      const group = new THREE.Group();
      const pos = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
      group.position.copy(pos);
      nodePositions.set(node.id, pos);

      const risk = modelOutput?.node_risk[node.id] ?? 0.05;
      const baseColor = getRiskColor(risk);

      // Geometry based on asset type
      if (node.type === 'transformer') {
        // Step-up / step-down Transformer (heavy cylinder with cooling fins)
        const cylinderGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.6,
          roughness: 0.3,
          emissive: baseColor,
          emissiveIntensity: risk > 0.7 ? 0.6 : 0.15
        });
        const mesh = new THREE.Mesh(cylinderGeo, mat);
        mesh.position.y = 0.6;
        group.add(mesh);

        // High-voltage Bushings
        const bushingGeo = new THREE.ConeGeometry(0.12, 0.45, 8);
        const bushingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const b1 = new THREE.Mesh(bushingGeo, bushingMat);
        b1.position.set(0.2, 1.35, 0);
        const b2 = new THREE.Mesh(bushingGeo, bushingMat);
        b2.position.set(-0.2, 1.35, 0);
        group.add(b1, b2);

      } else if (node.type === 'substation') {
        // Substation (Heavy structure with steel truss base)
        const baseGeo = new THREE.BoxGeometry(1.4, 0.6, 1.4);
        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.5,
          roughness: 0.4,
          emissive: baseColor,
          emissiveIntensity: risk > 0.7 ? 0.5 : 0.15
        });
        const mesh = new THREE.Mesh(baseGeo, mat);
        mesh.position.y = 0.3;
        group.add(mesh);

        // Tower frame
        const frameGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
        [-0.5, 0.5].forEach(x => {
          [-0.5, 0.5].forEach(z => {
            const leg = new THREE.Mesh(frameGeo, frameMat);
            leg.position.set(x, 0.9, z);
            group.add(leg);
          });
        });

      } else if (node.type === 'generator') {
        // Generator (Hexagonal turbine house)
        const genGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.9, 6);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.7,
          roughness: 0.2,
          emissive: 0x0284c7,
          emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(genGeo, mat);
        mesh.position.y = 0.45;
        group.add(mesh);

      } else {
        // Standard Bus / Load Sphere
        const sphereGeo = new THREE.SphereGeometry(0.42, 20, 20);
        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.4,
          roughness: 0.3,
          emissive: baseColor,
          emissiveIntensity: risk > 0.7 ? 0.7 : 0.2
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.y = 0.42;
        group.add(mesh);
      }

      // Outer Halo Ring for selection or high risk
      const isSelected = selectedNodeId === node.id;
      const isRootCause = modelOutput?.root_cause_ranking?.[0]?.node === node.id;

      if (isSelected || isRootCause || risk > 0.75) {
        const ringGeo = new THREE.RingGeometry(0.85, 1.05, 32);
        const ringColor = isRootCause ? 0xef4444 : (isSelected ? 0x00f0ff : baseColor);
        const ringMat = new THREE.MeshBasicMaterial({
          color: ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.05;
        group.add(ringMesh);
      }

      group.userData = { nodeId: node.id, nodeData: node };
      scene.add(group);
      nodeMeshesRef.current.set(node.id, group);
    });

    // 2. Create 3D Transmission Lines & Flow Particles
    edges.forEach(edge => {
      const p1 = nodePositions.get(edge.source);
      const p2 = nodePositions.get(edge.target);
      if (!p1 || !p2) return;

      const v1 = p1.clone().add(new THREE.Vector3(0, 0.4, 0));
      const v2 = p2.clone().add(new THREE.Vector3(0, 0.4, 0));

      // Tube Curve
      const midPoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      midPoint.y += 0.35; // Slight sag / catenary elevation

      const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);

      // Check if line is on cascade path
      const isCascadeBranch = modelOutput?.cascade_path?.includes(edge.source) &&
                             modelOutput?.cascade_path?.includes(edge.target);

      const lineColor = edge.is_tripped
        ? new THREE.Color(0x475569) // Dark gray tripped
        : (isCascadeBranch ? new THREE.Color(0xef4444) : new THREE.Color(0x0284c7));

      const tubeMat = new THREE.MeshStandardMaterial({
        color: lineColor,
        emissive: isCascadeBranch ? 0xef4444 : 0x00e5ff,
        emissiveIntensity: isCascadeBranch ? 0.8 : (edge.loading_pct > 80 ? 0.5 : 0.1),
        metalness: 0.5,
        roughness: 0.4,
        transparent: edge.is_tripped,
        opacity: edge.is_tripped ? 0.35 : 0.9
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
      edgeMeshesRef.current.set(edge.id, tubeMesh);

      // Add Flowing Particles along the line if active
      if (!edge.is_tripped && particleGroupRef.current) {
        const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: isCascadeBranch ? 0xff4d4d : 0x00f0ff
        });

        // 2 particles per active transmission line
        for (let i = 0; i < 2; i++) {
          const particle = new THREE.Mesh(particleGeo, particleMat);
          particle.userData = {
            curve,
            progress: i * 0.5,
            speed: (edge.loading_pct / 100) * 0.008 + 0.003
          };
          particleGroupRef.current.add(particle);
        }
      }
    });

  }, [nodes, edges, modelOutput, selectedNodeId, cascadeStep, getRiskColor]);

  // Raycasting for Hover & Click
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactables: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach(group => {
      interactables.push(...group.children);
    });

    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const parentGroup = hit.parent;
      if (parentGroup && parentGroup.userData.nodeData) {
        setHoveredNode({
          node: parentGroup.userData.nodeData,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        return;
      }
    }
    setHoveredNode(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactables: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach(group => {
      interactables.push(...group.children);
    });

    const intersects = raycaster.intersectObjects(interactables, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const parentGroup = hit.parent;
      if (parentGroup && parentGroup.userData.nodeId) {
        onSelectNode(parentGroup.userData.nodeId);
      }
    } else {
      onSelectNode(null);
    }
  };

  // Camera focus controls
  const focusRootCause = () => {
    const rootCauseNode = modelOutput?.root_cause_ranking?.[0]?.node;
    if (!rootCauseNode || !cameraRef.current || !controlsRef.current) return;
    const meshGroup = nodeMeshesRef.current.get(rootCauseNode);
    if (meshGroup) {
      const targetPos = meshGroup.position;
      cameraRef.current.position.set(targetPos.x + 4, targetPos.y + 6, targetPos.z + 6);
      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();
      onSelectNode(rootCauseNode);
    }
  };

  const resetView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 18, 22);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    onSelectNode(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />

      {/* Floating HUD Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredNode.x, top: hoveredNode.y }}
        >
          <div className="glass-panel-glow px-3 py-2 rounded-lg text-xs font-mono shadow-2xl border border-cyan-500/40 min-w-[210px]">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-1 mb-1.5">
              <span className="font-bold text-cyan-300 text-sm">{hoveredNode.node.id}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredNode.node.type}
              </span>
            </div>

            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span>Predicted Risk:</span>
                <span className={`font-bold ${
                  (modelOutput?.node_risk[hoveredNode.node.id] ?? 0) > 0.7 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {((modelOutput?.node_risk[hoveredNode.node.id] ?? 0) * 100).toFixed(0)}%
                </span>
              </div>

              {modelOutput?.confidence_interval[hoveredNode.node.id] && (
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>90% CI:</span>
                  <span>
                    {(modelOutput.confidence_interval[hoveredNode.node.id][0] * 100).toFixed(0)}% - {(modelOutput.confidence_interval[hoveredNode.node.id][1] * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Loading:</span>
                <span>{hoveredNode.node.features.load_pct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Voltage:</span>
                <span>{hoveredNode.node.features.voltage_pu.toFixed(3)} pu</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className={hoveredNode.node.features.temperature_c > 70 ? 'text-orange-400 font-semibold' : ''}>
                  {hoveredNode.node.features.temperature_c.toFixed(1)}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="glass-panel px-3 py-1.5 rounded-md text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center gap-1.5"
        >
          <span>↺</span> RESET VIEW
        </button>
        <button
          onClick={focusRootCause}
          className="glass-panel px-3 py-1.5 rounded-md text-xs font-mono text-amber-300 hover:text-amber-200 hover:border-amber-500/50 transition-all flex items-center gap-1.5"
        >
          <span>🎯</span> FOCUS ROOT CAUSE
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel px-3 py-2 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-4">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Risk Level:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span className="text-[11px]">0–20% Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
          <span className="text-[11px]">20–50% Watch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
          <span className="text-[11px]">50–75% High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] text-red-400 font-bold">75–100% Critical</span>
        </div>
      </div>
    </div>
  );
};
