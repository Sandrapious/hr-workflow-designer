// Types for workflow designer
export type NodeKind = 'start' | 'task' | 'approval' | 'automated' | 'end';
export type KeyValue = { key: string; value: string };

export interface BaseNodeData {
  id: string;
  type: NodeKind;
  label: string;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  metadata: KeyValue[];
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  approverRole: string;
  autoApproveThreshold?: number;   // value to compare against
  simulatedScore?: number;         // value used in simulation for auto-approve
}

export interface AutomatedNodeData extends BaseNodeData {
  type: 'automated';
  actionId?: string;
  params: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  endMessage?: string;
  summaryFlag: boolean;
}

export type AnyNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SerializedWorkflowNode {
  id: string;
  type: NodeKind;
  data: AnyNodeData;
}

export interface SerializedWorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface SerializedWorkflow {
  nodes: SerializedWorkflowNode[];
  edges: SerializedWorkflowEdge[];
}

export interface WorkflowSimulationStep {
  stepId: string;
  nodeLabel: string;
  status: 'ok' | 'error';
  message: string;
}

export interface WorkflowSimulationResult {
  valid: boolean;
  issues: string[];
  steps: WorkflowSimulationStep[];
}
