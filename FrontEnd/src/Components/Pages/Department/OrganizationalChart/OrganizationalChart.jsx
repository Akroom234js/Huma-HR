import React, { useEffect, useCallback, useState, useMemo } from "react";
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
import Avatar from "../../../Shared/Avatar/Avatar";
import apiClient from "../../../../apiConfig";

/* ── Dagre Layout Engine ─────────────────────────────────────────────── */
const nodeWidth = 230;
const nodeHeight = 110;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 90, nodesep: 50 });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const isHorizontal = direction === "LR";
  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
        },
      };
    }),
    edges,
  };
};

/* ── Custom Node Component ───────────────────────────────────────────── */
const OrgNode = ({ data }) => {
  return (
    <div
      className={[
        "occ-card-node",
        data.isVacant ? "occ-vacant" : "",
        data.isManagerial ? "occ-managerial" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Handle type="target" position={Position.Top} className="occ-handle" />

      <div className="occ-dept-badge">{data.department}</div>

      <div className="occ-card-content">
        {data.employee ? (
          <>
            <Avatar
              user={{
                full_name: data.employee.name,
                profile_pic: data.employee.avatar,
              }}
              size="sm"
            />
            <div className="occ-info">
              <span className="occ-card-name">{data.employee.name}</span>
              <span className="occ-card-title">{data.title}</span>
            </div>
          </>
        ) : (
          <>
            <div className="occ-vacant-icon">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div className="occ-info">
              <span className="occ-card-name occ-vacant-label">Vacant</span>
              <span className="occ-card-title">{data.title}</span>
            </div>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="occ-handle" />
    </div>
  );
};

const nodeTypes = { orgNode: OrgNode };

/* ── Main Component ──────────────────────────────────────────────────── */
const OrganizationalChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [vacantOnly, setVacantOnly] = useState(false);
  const [direction, setDirection] = useState("TB");

  /* ── Fetch chart data ────────────────────────────────────────────── */
  const fetchChart = useCallback(
    async (departmentId = null) => {
      setLoading(true);
      setError(null);
      try {
        const url = departmentId
          ? `/org-chart/department/${departmentId}`
          : "/org-chart";
        const { data } = await apiClient.get(url);
        const rawNodes = data.data.nodes;
        const rawEdges = data.data.edges;

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(rawNodes, rawEdges, direction);

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load org chart.");
      } finally {
        setLoading(false);
      }
    },
    [direction, setNodes, setEdges]
  );

  /* ── Fetch department list for filter ────────────────────────────── */
  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/departments");
      setDepartments(data.data || data || []);
    } catch {
      // silently fail — filters become unavailable
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchChart(deptFilter || null);
  }, [deptFilter, fetchChart]);

  /* ── Layout direction toggle ─────────────────────────────────────── */
  const handleLayout = useCallback(
    (dir) => {
      setDirection(dir);
      fetchChart(deptFilter || null);
    },
    [deptFilter, fetchChart]
  );

  /* ── Vacant filter (client-side) ─────────────────────────────────── */
  const visibleNodes = useMemo(
    () =>
      vacantOnly ? nodes.filter((n) => n.data?.isVacant) : nodes,
    [nodes, vacantOnly]
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="org-chart-wrapper">
      <div className="chart-header">
        <div className="chart-title-area">
          <span className="org-subtitle">Company Structure</span>
          <h1>Organizational Chart</h1>
        </div>
        <div className="controls-btns">
          <select
            className="org-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <label className="org-toggle-label">
            <input
              type="checkbox"
              checked={vacantOnly}
              onChange={(e) => setVacantOnly(e.target.checked)}
              className="org-toggle-input"
            />
            <span className="org-toggle-text">Vacant Only</span>
          </label>

          <button
            className={`org-layout-btn ${direction === "TB" ? "active" : ""}`}
            onClick={() => handleLayout("TB")}
          >
            <span className="material-symbols-outlined">vertical_distribute</span>
            Vertical
          </button>
          <button
            className={`org-layout-btn ${direction === "LR" ? "active" : ""}`}
            onClick={() => handleLayout("LR")}
          >
            <span className="material-symbols-outlined">horizontal_distribute</span>
            Horizontal
          </button>
          <ThemeToggle />
        </div>
      </div>

      {loading && (
        <div className="org-state-overlay">
          <div className="org-spinner"></div>
          <p>Loading chart...</p>
        </div>
      )}

      {error && !loading && (
        <div className="org-error-banner">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={() => fetchChart(deptFilter || null)}>Retry</button>
        </div>
      )}

      <div style={{ width: "100%", height: "80vh" }} className="flow-container">
        <ReactFlow
          nodes={visibleNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background gap={20} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
};

export default OrganizationalChart;
