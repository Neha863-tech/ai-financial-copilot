import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AgentType, MultiAgentSystemState } from '../../types/agent';

interface Agent3DSceneProps {
  systemState: MultiAgentSystemState;
  activeAgentId: AgentType | null;
  onSelectAgent: (id: AgentType) => void;
}

// Single 3D Agent Node component
const AgentNodeMesh: React.FC<{
  id: AgentType;
  name: string;
  position: [number, number, number];
  color: string;
  glowColor: string;
  status: string;
  progress: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ id, name, position, color, status, progress, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Status visual states
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isWarning = status === 'warning';
  const isPending = !isRunning && !isCompleted && !isFailed && !isWarning;

  // Active status color
  const statusColor = isRunning
    ? '#38BDF8'
    : isCompleted
    ? '#10B981'
    : isFailed
    ? '#EF4444'
    : isWarning
    ? '#F59E0B'
    : '#64748B';

  const nodeColor = isFailed ? '#EF4444' : isWarning ? '#F59E0B' : color;

  useFrame((state, delta) => {
    // Rotation animation driven only by real agent execution state
    if (ringRef.current) {
      if (isRunning) {
        ringRef.current.rotation.z += delta * 2.8;
        ringRef.current.rotation.x += delta * 0.6;
      } else if (isCompleted) {
        ringRef.current.rotation.z += delta * 0.4;
      } else if (isFailed) {
        // Error vibration
        ringRef.current.rotation.z += delta * 0.1 + Math.sin(state.clock.elapsedTime * 14) * 0.08;
      } else if (isWarning) {
        // Warning stutter
        ringRef.current.rotation.z += delta * 0.2 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      } else {
        // Pending / idle: barely moving
        ringRef.current.rotation.z += delta * 0.08;
      }
    }

    // Core pulsing scale only when actively running, warning, or failed
    if (meshRef.current) {
      if (isRunning) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.09);
      } else if (isFailed) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 12) * 0.06);
      } else if (isWarning) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Selection Focus Ring */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.95, 1.02, 36]} />
          <meshBasicMaterial color="#C084FC" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Outer Halo Ring */}
      <mesh ref={ringRef} onClick={onClick}>
        <torusGeometry args={[0.75, isRunning ? 0.04 : 0.025, 16, 48]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={
            isSelected
              ? 1.5
              : isRunning
              ? 1.2
              : isCompleted
              ? 0.7
              : isFailed
              ? 1.3
              : isWarning
              ? 1.0
              : 0.15
          }
          roughness={0.2}
          wireframe={isRunning}
        />
      </mesh>

      {/* Central Spherical Core */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={
            isSelected || hovered
              ? 0.95
              : isRunning
              ? 0.75
              : isCompleted
              ? 0.45
              : isFailed
              ? 0.85
              : isWarning
              ? 0.7
              : 0.12
          }
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* 3D Agent Label */}
      <Text
        position={[0, -0.95, 0]}
        fontSize={0.24}
        color={isSelected ? '#FFFFFF' : isPending ? '#94A3B8' : '#F1F5F9'}
        anchorX="center"
        anchorY="middle"
      >
        {name.toUpperCase()}
      </Text>

      {/* Status Sub-text */}
      <Text
        position={[0, -1.25, 0]}
        fontSize={0.16}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {isRunning
          ? `RUNNING (${progress}%)`
          : isCompleted
          ? 'COMPLETED (100%)'
          : isFailed
          ? 'FAILED (ERROR)'
          : isWarning
          ? 'DISCREPANCY FLAGGED'
          : 'PENDING'}
      </Text>
    </group>
  );
};

// Central orchestrator nexus between agents
const CentralNexus: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const centralMesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (centralMesh.current) {
      centralMesh.current.rotation.y += delta * (isRunning ? 2.2 : 0.4);
      centralMesh.current.rotation.z += delta * (isRunning ? 0.6 : 0.2);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Orchestrator Core */}
      <mesh ref={centralMesh}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#7C3AED"
          emissiveIntensity={isRunning ? 1.6 : 0.5}
          roughness={0.1}
          metalness={0.8}
          wireframe={isRunning}
        />
      </mesh>

      <Text
        position={[0, 0.75, 0]}
        fontSize={0.2}
        color="#E2E8F0"
        anchorX="center"
        anchorY="middle"
      >
        LANGGRAPH NEXUS
      </Text>
    </group>
  );
};

export const Agent3DScene: React.FC<Agent3DSceneProps> = ({
  systemState,
  activeAgentId,
  onSelectAgent,
}) => {
  const agents = systemState.agents;
  const isRunning = systemState.status === 'running';

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 rounded-3xl overflow-hidden border border-navy-800 shadow-2xl">
      {/* Top watermark / mode badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/90 text-xs font-mono backdrop-blur-md border border-navy-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-electric-400 animate-ping'
                : systemState.isSimulatedDemo
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span className={systemState.isSimulatedDemo ? 'text-amber-300' : 'text-emerald-300'}>
            {systemState.isSimulatedDemo
              ? 'CLIENT DEMO HARNESS (FASTAPI DISCONNECTED)'
              : 'LIVE LANGGRAPH SSE STREAM (PORT 8000)'}
          </span>
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span className="text-[11px] text-slate-400 bg-navy-900/80 px-2.5 py-1 rounded-lg border border-navy-800">
          Rotate 3D Scene / Click Nodes
        </span>
      </div>

      {/* React Three Fiber Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={10}
          minDistance={4}
          autoRotate={!isRunning}
          autoRotateSpeed={0.5}
        />

        {/* Central Orchestrator */}
        <CentralNexus isRunning={isRunning} />

        {/* 5 LangGraph Agent Nodes */}
        {(Object.keys(agents) as AgentType[]).map((agentKey) => {
          const agent = agents[agentKey];
          if (!agent) return null;
          const isNodeActive = agent.status === 'running' || agentKey === activeAgentId;
          const isNodeCompleted = agent.status === 'completed';

          return (
            <React.Fragment key={agent.id}>
              {/* Radial Connection Line to Central Nexus */}
              <Line
                points={[[0, 0, 0], agent.position3D]}
                color={agent.color}
                lineWidth={isNodeActive ? 2.5 : isNodeCompleted ? 1.5 : 1}
                transparent
                opacity={isNodeActive ? 0.95 : isNodeCompleted ? 0.45 : 0.15}
              />

              {/* Node Mesh */}
              <AgentNodeMesh
                id={agent.id}
                name={agent.name}
                position={agent.position3D}
                color={agent.color}
                glowColor={agent.glowColor}
                status={agent.status}
                progress={agent.progress}
                isSelected={agentKey === activeAgentId}
                onClick={() => onSelectAgent(agentKey)}
              />
            </React.Fragment>
          );
        })}

        {/* Dynamic Inter-Agent Communication Channels (Glow only when backend events occur) */}
        {(
          [
            ['research', 'comparison', '#818CF8'],
            ['comparison', 'budget', '#C084FC'],
            ['budget', 'recommendation', '#F472B6'],
            ['recommendation', 'verification', '#34D399'],
            ['verification', 'research', '#38BDF8'],
            ['comparison', 'recommendation', '#A78BFA'],
          ] as [AgentType, AgentType, string][]
        ).map(([fromKey, toKey, linkColor], idx) => {
          const a1 = agents[fromKey];
          const a2 = agents[toKey];
          if (!a1 || !a2) return null;

          const isActive = a1.status === 'running' || a2.status === 'running';
          const isBothCompleted = a1.status === 'completed' && a2.status === 'completed';

          return (
            <Line
              key={`link-${idx}`}
              points={[a1.position3D, a2.position3D]}
              color={linkColor}
              lineWidth={isActive ? 2.2 : isBothCompleted ? 1.4 : 0.8}
              transparent
              opacity={isActive ? 0.9 : isBothCompleted ? 0.4 : 0.12}
            />
          );
        })}
      </Canvas>
    </div>
  );
};
