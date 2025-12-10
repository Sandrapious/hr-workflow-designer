import React, { useEffect, useState } from 'react';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeFormPanel } from './components/NodeForms';
import { TestPanel } from './components/TestPanel';
import { getAutomations, simulateWorkflow } from './api/mockApi';
import type {
  AnyNodeData,
  AutomationAction,
  SerializedWorkflow,
  WorkflowSimulationResult,
} from './types/workflow';
import type { Node, Edge } from 'reactflow';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node<AnyNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<AnyNodeData | null>(null);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [simResult, setSimResult] = useState<WorkflowSimulationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAutomations().then(setAutomations);
  }, []);

  const handleNodeChange = (updated: AnyNodeData) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === updated.id ? { ...n, data: updated } : n
      )
    );
    setSelectedNode(updated);
  };

  const serialize = (): SerializedWorkflow | null => {
    if (!nodes.length) return null;
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.data as AnyNodeData).type,
        data: n.data as AnyNodeData,
      })),
      edges: edges.map((e) => ({
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
      })),
    };
  };

  const runSimulation = async () => {
    const wf = serialize();
    if (!wf) return;

    setLoading(true);
    setSimResult(null);
    try {
      const res = await simulateWorkflow(wf);
      setSimResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '1rem',
          background: '#001529',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>HR Workflow Designer</h2>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 3 }}>
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onSelectionChange={setSelectedNode}
          />
        </div>

        <div
          style={{
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #ddd',
            background: '#f9f9f9',
          }}
        >
          <div style={{ flex: 1, overflow: 'auto' }}>
            <NodeFormPanel
              selectedNode={selectedNode}
              automations={automations}
              onChange={handleNodeChange}
            />
          </div>

          <div
            style={{
              height: 320,
              borderTop: '1px solid #ddd',
              background: 'white',
            }}
          >
            <TestPanel
              serialized={serialize()}
              result={simResult}
              onRun={runSimulation}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
