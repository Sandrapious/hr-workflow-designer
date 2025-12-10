import React from 'react';
import type {
  SerializedWorkflow,
  WorkflowSimulationResult,
} from '../types/workflow';

type Props = {
  serialized: SerializedWorkflow | null;
  result: WorkflowSimulationResult | null;
  onRun: () => void;
  loading: boolean;
};

export const TestPanel: React.FC<Props> = ({
  serialized,
  result,
  onRun,
  loading,
}) => {
  const canRun = !!serialized;

  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid #eee',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Simulation</h3>
      <button
        onClick={onRun}
        disabled={loading || !canRun}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: 6,
          border: 'none',
          background: canRun ? '#1890ff' : '#d9d9d9',
          color: 'white',
          fontWeight: 600,
          cursor: loading || !canRun ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Running...' : 'Run Simulation'}
      </button>

      {result && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <p
            style={{
              fontWeight: 'bold',
              color: result.valid ? '#52c41a' : '#ff4d4f',
            }}
          >
            {result.valid ? 'Valid workflow ✅' : 'Issues Found ❌'}
          </p>

          {result.issues.length > 0 && (
            <ul style={{ color: '#ff4d4f', paddingLeft: '1.25rem' }}>
              {result.issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}

          <h4 style={{ marginTop: '1rem' }}>Execution Steps</h4>
          <ol style={{ paddingLeft: '1.25rem' }}>
            {result.steps.map((s) => (
              <li key={s.stepId}>
                <strong>{s.nodeLabel}</strong>: {s.message}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
