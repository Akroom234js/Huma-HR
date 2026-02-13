import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./OrganizationalChart.css";

/* ---------- Custom Node ---------- */
const CardNode = ({ data }) => {
  return (
    <div className="card-node">
      <img src={data.image} alt="" className="card-image" />
      <div className="card-name">{data.label}</div>
      <div className="card-title">{data.title}</div>
    </div>
  );
};

const nodeTypes = {
  card: CardNode,
};

/* ---------- Nodes ---------- */
const initialNodes = [
  {
    id: "ceo",
    type: "card",
    position: { x: 400, y: 0 },
    data: {
      label: "John Smith",
      title: "CEO",
      image: "https://i.pravatar.cc/100?img=1",
    },
  },
  {
    id: "hr",
    type: "card",
    position: { x: 200, y: 200 },
    data: {
      label: "Sarah Connor",
      title: "HR Manager",
      image: "https://i.pravatar.cc/100?img=2",
    },
  },
  {
    id: "tech",
    type: "card",
    position: { x: 600, y: 200 },
    data: {
      label: "Michael Lee",
      title: "Tech Manager",
      image: "https://i.pravatar.cc/100?img=3",
    },
  },
];

/* ---------- Edges ---------- */
const initialEdges = [
  {
    id: "e1",
    source: "ceo",
    target: "hr",
    type: "step",
    style: { stroke: "#e2e8f0", strokeWidth: 1 },
  },
  {
    id: "e2",
    source: "ceo",
    target: "tech",
    type: "step",
    style: { stroke: "#e2e8f0", strokeWidth: 1 },
  },
];

const OrganizationalChart = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: "100%", height: "700px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default OrganizationalChart;
