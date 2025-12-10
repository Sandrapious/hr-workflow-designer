import React from 'react';
import type {
  AnyNodeData,
  AutomationAction,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types/workflow';

const fieldStyle = { display: 'block', marginBottom: '1rem' };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginTop: '6px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
};

// ---------- Start Form ----------

export const StartForm: React.FC<{
  data: StartNodeData;
  update: (d: StartNodeData) => void;
}> = ({ data, update }) => {
  const addMeta = () =>
    update({ ...data, metadata: [...data.metadata, { key: '', value: '' }] });

  const updateMeta = (i: number, key: string, value: string) => {
    const m = [...data.metadata];
    m[i] = { key, value };
    update({ ...data, metadata: m });
  };

  const removeMeta = (i: number) =>
    update({
      ...data,
      metadata: data.metadata.filter((_, idx) => idx !== i),
    });

  return (
    <div>
      <h4 style={{ margin: '0 0 1rem' }}>Metadata</h4>
      {data.metadata.map((m, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}
        >
          <input
            placeholder="Key"
            value={m.key}
            onChange={(e) => updateMeta(i, e.target.value, m.value)}
            style={inputStyle}
          />
          <input
            placeholder="Value"
            value={m.value}
            onChange={(e) => updateMeta(i, m.key, e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeMeta(i)}
            style={{
              padding: '8px 12px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addMeta}
        style={{
          padding: '10px 16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        + Add Metadata
      </button>
    </div>
  );
};

// ---------- Task Form ----------

export const TaskForm: React.FC<{
  data: TaskNodeData;
  update: (d: TaskNodeData) => void;
}> = ({ data, update }) => {
  const addField = () =>
    update({
      ...data,
      customFields: [...data.customFields, { key: '', value: '' }],
    });

  const updateField = (i: number, key: string, value: string) => {
    const f = [...data.customFields];
    f[i] = { key, value };
    update({ ...data, customFields: f });
  };

  const removeField = (i: number) =>
    update({
      ...data,
      customFields: data.customFields.filter((_, idx) => idx !== i),
    });

  return (
    <div>
      <label style={fieldStyle}>
        <span style={labelStyle}>Description</span>
        <textarea
          value={data.description || ''}
          onChange={(e) => update({ ...data, description: e.target.value })}
          style={{ ...inputStyle, height: 100, resize: 'vertical' }}
        />
      </label>
      <label style={fieldStyle}>
        <span style={labelStyle}>Assignee</span>
        <input
          value={data.assignee || ''}
          onChange={(e) => update({ ...data, assignee: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label style={fieldStyle}>
        <span style={labelStyle}>Due Date</span>
        <input
          type="date"
          value={data.dueDate || ''}
          onChange={(e) => update({ ...data, dueDate: e.target.value })}
          style={inputStyle}
        />
      </label>

      <h4 style={{ margin: '1.5rem 0 1rem' }}>Custom Fields</h4>
      {data.customFields.map((f, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}
        >
          <input
            placeholder="Key"
            value={f.key}
            onChange={(e) => updateField(i, e.target.value, f.value)}
            style={inputStyle}
          />
          <input
            placeholder="Value"
            value={f.value}
            onChange={(e) => updateField(i, f.key, e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeField(i)}
            style={{
              padding: '8px 12px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addField}
        style={{
          padding: '10px 16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        + Add Field
      </button>
    </div>
  );
};

// ---------- Approval Form (with auto-approve logic inputs) ----------

export const ApprovalForm: React.FC<{
  data: ApprovalNodeData;
  update: (d: ApprovalNodeData) => void;
}> = ({ data, update }) => (
  <div>
    <label style={fieldStyle}>
      <span style={labelStyle}>Approver Role</span>
      <input
        value={data.approverRole}
        onChange={(e) => update({ ...data, approverRole: e.target.value })}
        style={inputStyle}
      />
    </label>

    <label style={fieldStyle}>
      <span style={labelStyle}>Auto-approve Threshold</span>
      <input
        type="number"
        value={data.autoApproveThreshold ?? ''}
        onChange={(e) =>
          update({
            ...data,
            autoApproveThreshold: e.target.value
              ? Number(e.target.value)
              : undefined,
          })
        }
        style={inputStyle}
        placeholder="e.g. 80"
      />
    </label>

    <label style={fieldStyle}>
      <span style={labelStyle}>Simulated Score (for testing auto-approve)</span>
      <input
        type="number"
        value={data.simulatedScore ?? ''}
        onChange={(e) =>
          update({
            ...data,
            simulatedScore: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        style={inputStyle}
        placeholder="e.g. 75"
      />
    </label>

    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-0.5rem' }}>
      During simulation: if <strong>score ≥ threshold</strong>, the step will be
      auto-approved. Otherwise, it will be marked as a failed auto-approval.
    </p>
  </div>
);

// ---------- Automated Form ----------

export const AutomatedForm: React.FC<{
  data: AutomatedNodeData;
  automations: AutomationAction[];
  update: (d: AutomatedNodeData) => void;
}> = ({ data, automations, update }) => {
  const action = automations.find((a) => a.id === data.actionId);

  const selectAction = (id: string) => {
    const act = automations.find((a) => a.id === id);
    const params: Record<string, string> = {};
    act?.params.forEach((p) => (params[p] = data.params[p] || ''));
    update({ ...data, actionId: id, params });
  };

  return (
    <div>
      <label style={fieldStyle}>
        <span style={labelStyle}>Action</span>
        <select
          value={data.actionId || ''}
          onChange={(e) => selectAction(e.target.value)}
          style={{ ...inputStyle, padding: '10px' }}
        >
          <option value="">Select action</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      {action && (
        <>
          <h4 style={{ margin: '1.5rem 0 1rem' }}>Parameters</h4>
          {action.params.map((p) => (
            <label key={p} style={fieldStyle}>
              <span style={labelStyle}>{p}</span>
              <input
                value={data.params[p] || ''}
                onChange={(e) =>
                  update({
                    ...data,
                    params: { ...data.params, [p]: e.target.value },
                  })
                }
                style={inputStyle}
                placeholder={`Enter ${p}`}
              />
            </label>
          ))}
        </>
      )}
    </div>
  );
};

// ---------- End Form ----------

export const EndForm: React.FC<{
  data: EndNodeData;
  update: (d: EndNodeData) => void;
}> = ({ data, update }) => (
  <div>
    <label style={fieldStyle}>
      <span style={labelStyle}>End Message</span>
      <input
        value={data.endMessage || ''}
        onChange={(e) => update({ ...data, endMessage: e.target.value })}
        style={inputStyle}
      />
    </label>
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: '1rem',
      }}
    >
      <input
        type="checkbox"
        checked={data.summaryFlag}
        onChange={(e) =>
          update({ ...data, summaryFlag: e.target.checked })
        }
        style={{ width: 20, height: 20 }}
      />
      <span style={{ fontWeight: 'bold' }}>
        Include summary at completion
      </span>
    </label>
  </div>
);

// ---------- Main NodeFormPanel ----------

type PanelProps = {
  selectedNode: AnyNodeData | null;
  automations: AutomationAction[];
  onChange: (node: AnyNodeData) => void;
};

export const NodeFormPanel: React.FC<PanelProps> = ({
  selectedNode,
  automations,
  onChange,
}) => {
  if (!selectedNode) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#888',
          fontSize: '1rem',
        }}
      >
        <em>Select a node to configure its properties</em>
      </div>
    );
  }

  const node = selectedNode;
  const icon =
    ({
      start: '🚀',
      task: '✅',
      approval: '👀',
      automated: '🤖',
      end: '🏁',
    } as Record<string, string>)[node.type] || '⬜';

  return (
    <div
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
          {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
        </h3>
      </div>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <strong>Label</strong>
        <input
          type="text"
          value={node.label}
          onChange={(e) => onChange({ ...node, label: e.target.value })}
          style={inputStyle}
        />
      </label>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        {node.type === 'start' && (
          <StartForm
            data={node as StartNodeData}
            update={(d) => onChange(d)}
          />
        )}
        {node.type === 'task' && (
          <TaskForm
            data={node as TaskNodeData}
            update={(d) => onChange(d)}
          />
        )}
        {node.type === 'approval' && (
          <ApprovalForm
            data={node as ApprovalNodeData}
            update={(d) => onChange(d)}
          />
        )}
        {node.type === 'automated' && (
          <AutomatedForm
            data={node as AutomatedNodeData}
            automations={automations}
            update={(d) => onChange(d)}
          />
        )}
        {node.type === 'end' && (
          <EndForm data={node as EndNodeData} update={(d) => onChange(d)} />
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 8,
          color: '#389e0d',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        ✅ Changes saved automatically
      </div>
    </div>
  );
};
