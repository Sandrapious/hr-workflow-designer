import React from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { AnyNodeData, NodeKind } from '../types/workflow';

const nodeIcons: Record<NodeKind, string> = {
  start: '🚀',
  task: '✅',
  approval: '👀',
  automated: '🤖',
  end: '🏁',
};
const nodeColors: Record<NodeKind, string> = {
  start: '#e6f7ff',
  task: '#fffbe6',
  approval: '#f6ffed',
  automated: '#f9f0ff',
  end: '#fff1f0',
};

const TypedNode: React.FC<NodeProps<AnyNodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '16px 24px',
        background: nodeColors[data.type],
        border: `2px solid ${selected ? '#1890ff' : '#d9d9d9'}`,
        borderRadius: 16,
        minWidth: 200,
        textAlign: 'center',
        boxShadow: selected
          ? '0 8px 24px rgba(24,144,255,0.25)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>
        {nodeIcons[data.type]}
      </div>
      <strong style={{ fontSize: '1.1rem', display: 'block' }}>
        {data.label}
      </strong>
      <div
        style={{
          fontSize: '0.8rem',
          color: '#595959',
          marginTop: 6,
          opacity: 0.8,
        }}
      >
        {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes: NodeTypes = { custom: TypedNode };

type Props = {
  nodes: Node<AnyNodeData>[];
  edges: Edge[];
  onNodesChange: (nodes: Node<AnyNodeData>[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onSelectionChange: (node: AnyNodeData | null) => void;
};

export const WorkflowCanvas: React.FC<Props> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSelectionChange,
}) => {
  const onConnect = React.useCallback(
    (conn: Connection) =>
      onEdgesChange(addEdge({ ...conn, animated: true }, edges)),
    [edges, onEdgesChange]
  );

  const addNode = React.useCallback(
    (kind: NodeKind) => {
      const id = `${kind}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newNode: Node<AnyNodeData> = {
        id,
        type: 'custom',
        position: {
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
        },
        data: createNodeData(kind, id),
      };
      onNodesChange([...nodes, newNode]);
    },
    [nodes, onNodesChange]
  );

  const exportWorkflow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        onNodesChange(json.nodes || []);
        onEdgesChange(json.edges || []);
      } catch {
        alert('Invalid workflow file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(chs) =>
          onNodesChange(applyNodeChanges(chs, nodes))
        }
        onEdgesChange={(chs) =>
          onEdgesChange(applyEdgeChanges(chs, edges))
        }
        onConnect={onConnect}
        onNodeClick={(_, node) =>
          onSelectionChange({ ...(node.data as AnyNodeData), id: node.id })
        }
        onPaneClick={() => onSelectionChange(null)}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(n: Node<AnyNodeData>) =>
            nodeColors[n.data.type as NodeKind]
          }
        />
      </ReactFlow>

      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 16,
          background: 'white',
          padding: 24,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 10,
          width: 240,
        }}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '1.3rem' }}>Add Nodes</h3>
        {(['start', 'task', 'approval', 'automated', 'end'] as NodeKind[]).map(
          (k) => (
            <button
              key={k}
              onClick={() => addNode(k)}
              style={{
                width: '100%',
                padding: '14px',
                marginBottom: 12,
                background: nodeColors[k],
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{nodeIcons[k]}</span>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          )
        )}

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '2px dashed #eee',
          }}
        >
          <button
            onClick={exportWorkflow}
            style={{
              width: '100%',
              padding: 14,
              marginBottom: 12,
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            📤 Export
          </button>

          <div style={{ width: '100%' }}>
            <label
              style={{
                width: '100%',
                display: 'inline-block',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: '100%',
                  padding: 14,
                  background: '#fa8c16',
                  color: 'white',
                  borderRadius: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                }}
              >
                📥 Import
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

function createNodeData(kind: NodeKind, id: string): AnyNodeData {
  switch (kind) {
    case 'start':
      return {
        id,
        type: 'start',
        label: 'Start Process',
        metadata: [],
      };
    case 'task':
      return {
        id,
        type: 'task',
        label: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return {
        id,
        type: 'approval',
        label: 'Approval Required',
        approverRole: '',
        autoApproveThreshold: undefined,
        simulatedScore: undefined,
      };
    case 'automated':
      return {
        id,
        type: 'automated',
        label: 'Automated Action',
        actionId: undefined,
        params: {},
      };
    case 'end':
      return {
        id,
        type: 'end',
        label: 'End',
        endMessage: 'Completed!',
        summaryFlag: true,
      };
  }
}
