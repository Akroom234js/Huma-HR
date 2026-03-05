
import React, { useEffect, useCallback } from "react";
import {

  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import dagre from "dagre";

import "@xyflow/react/dist/style.css";
import "./OrganizationalChart.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

/* ---------- Dagre Layout Engine ---------- */
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 120;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

/* ---------- Custom Node ---------- */
const CardNode = ({ data }) => {
  return (
    <div className="occ-card-node">
      <Handle type="target" position={Position.Top} className="occ-handle" />
      <div className="occ-card-content">
        <div className="occ-image-container">
          <img src={data.image} alt={data.label} className="occ-card-image" />
          <div className="occ-badge">{data.dept}</div>
        </div>
        <div className="occ-info">
          <div className="occ-card-name">{data.label}</div>
          <div className="occ-card-title">{data.title}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="occ-handle" />
    </div>
  );
};

const nodeTypes = {
  card: CardNode,
};

/* ---------- Initial Data ---------- */
// Hierarchy: CEO -> Head of Eng -> Team Leads -> Devs
const initialNodes = [
  {
    id: "1",
    type: "card",
    data: { label: "Lana Steiner", title: "CEO", dept: "Management", image: "https://i.pravatar.cc/150?img=32" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "card",
    data: { label: "Candice Wu", title: "Head of Engineering", dept: "Engineering", image: "https://i.pravatar.cc/150?img=1" },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "card",
    data: { label: "Phoenix Baker", title: "Head of Design", dept: "Design", image: "https://i.pravatar.cc/150?img=5" },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "card",
    data: { label: "James Gardner", title: "Frontend Lead", dept: "Engineering", image: "https://i.pravatar.cc/150?img=8" },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "card",
    data: { label: "Aria Patel", title: "Backend Lead", dept: "Engineering", image: "https://i.pravatar.cc/150?img=9" },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    type: "card",
    data: { label: "Leo Rivera", title: "DevOps Lead", dept: "Engineering", image: "https://i.pravatar.cc/150?img=11" },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    type: "card",
    data: { label: "Ava Garcia", title: "Sr. Frontend Dev", dept: "Engineering", image: "https://i.pravatar.cc/150?img=12" },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    type: "card",
    data: { label: "Lucas Martinez", title: "Sr. Backend Dev", dept: "Engineering", image: "https://i.pravatar.cc/150?img=13" },
    position: { x: 0, y: 0 },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: true },
  { id: "e1-3", source: "1", target: "3", type: "smoothstep", animated: true },
  { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
  { id: "e2-5", source: "2", target: "5", type: "smoothstep" },
  { id: "e2-6", source: "2", target: "6", type: "smoothstep" },
  { id: "e4-7", source: "4", target: "7", type: "smoothstep" },
  { id: "e5-8", source: "5", target: "8", type: "smoothstep" },
];

const OrganizationalChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    onLayout("TB");
  }, [onLayout]);

  return (
    <div className="org-chart-wrapper">
      <div className="chart-header">
        <h1>Organizational Chart</h1>
        <div className="controls-btns">
          <ThemeToggle />
          <button onClick={() => onLayout("TB")}>Vertical</button>
          <button onClick={() => onLayout("LR")}>Horizontal</button>
        </div>
      </div>
      <div style={{ width: "100%", height: "80vh" }} className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
};

export default OrganizationalChart;
