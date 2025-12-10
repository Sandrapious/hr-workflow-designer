import type {
  AutomationAction,
  SerializedWorkflow,
  WorkflowSimulationResult,
  AnyNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
} from '../types/workflow';

const mockAutomations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
];

export async function getAutomations(): Promise<AutomationAction[]> {
  await new Promise((r) => setTimeout(r, 300));
  return mockAutomations;
}

export async function simulateWorkflow(
  wf: SerializedWorkflow
): Promise<WorkflowSimulationResult> {
  await new Promise((r) => setTimeout(r, 700));

  const { nodes, edges } = wf;
  const issues: string[] = [];
  const steps: WorkflowSimulationResult['steps'] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length !== 1) {
    issues.push(`Exactly one Start node required (found ${startNodes.length})`);
  }
  if (!nodes.some((n) => n.type === 'end')) {
    issues.push('At least one End node required');
  }

  // outgoing edges map
  const outgoing = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source)!.push(e.target);
  });

  const visited = new Set<string>();

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) {
      issues.push('Cycle detected in workflow');
      return;
    }
    visited.add(nodeId);

    const nodeWrapper = nodes.find((n) => n.id === nodeId);
    if (!nodeWrapper) return;

    const data = nodeWrapper.data as AnyNodeData;
    const step: {
      stepId: string;
      nodeLabel: string;
      status: 'ok' | 'error';
      message: string;
    } = {
      stepId: (steps.length + 1).toString(),
      nodeLabel: data.label,
      status: 'ok',
      message: '',
    };

    switch (nodeWrapper.type) {
      case 'start':
        step.message = 'Workflow started';
        break;

      case 'task': {
        const td = data as TaskNodeData;
        step.message = `Task -> Assignee: ${td.assignee || 'Unassigned'}; Due: ${
          td.dueDate || '—'
        }`;
        break;
      }

      case 'approval': {
        const ad = data as ApprovalNodeData;
        const role = ad.approverRole || 'Unknown role';
        const threshold = ad.autoApproveThreshold;
        const score = ad.simulatedScore;

        if (threshold !== undefined && score !== undefined) {
          if (score >= threshold) {
            step.message = `Auto-approved by ${role} (score ${score} ≥ ${threshold})`;
            // stays status "ok"
          } else {
            step.message = `Auto-approval failed (score ${score} < ${threshold}); manual approval required from ${role}`;
            step.status = 'error';
            issues.push(`Auto-approve threshold not met at "${data.label}"`);
          }
        } else if (threshold !== undefined && score === undefined) {
          step.message = `Auto-approve threshold ${threshold} set, but no simulated score provided; manual approval required from ${role}`;
        } else {
          step.message = `Approval requested from ${role}`;
        }
        break;
      }

      case 'automated': {
        const au = data as AutomatedNodeData;
        const action = mockAutomations.find((a) => a.id === au.actionId);
        step.message = `Automated action: ${action?.label || 'Unknown action'}`;
        break;
      }

      case 'end':
        step.message = 'Workflow completed';
        break;
    }

    steps.push(step);

    (outgoing.get(nodeId) || []).forEach(dfs);
  };

  if (startNodes.length === 1) {
    dfs(startNodes[0].id);
  }

  if (nodes.length > visited.size && issues.length === 0) {
    issues.push('Some nodes are not connected to the workflow');
  }

  return {
    valid: issues.length === 0,
    issues,
    steps,
  };
}
