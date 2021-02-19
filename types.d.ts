export interface IApplicationState {
  project: IProject
  userInterface: IUserInterfaceState
}

export interface IUserInterfaceState {
  confirmDialog?: IConfirmDialog
  hasUnsavedChanges?: boolean
  filename?: string
  lastExportFilename?: string
  isSequencesListOpen?: boolean
  selectedSequenceIndex: number
  selectedNodeIndex: number
}

export interface IConfirmDialog {
  message?: string
  buttons?: string[]
  response?: number
}

export interface IProject {
  savedWithVersion: number
  sequences: ISequence[]
}

export interface ISequence {
  id: string
  name: string
  nodes: INode[]
  updatedAt: Date
}

export interface INode {
  id: string
  name: string
  lines: INodeLine[]
  responses: INodeResponse[]
  updatedAt: Date
}

export interface INodeLink {
  id: string
  goToNodeName?: string
  goToNodeId?: string
}

export interface INodeLine {
  id: string
  comment?: string
  condition?: string
  character?: string
  dialogue?: string
  mutation?: string
  goToNodeName?: string
  goToNodeId?: string
}

export interface INodeResponse {
  id: string
  condition?: string
  prompt?: string
  goToNodeName?: string
  goToNodeId?: string
}
