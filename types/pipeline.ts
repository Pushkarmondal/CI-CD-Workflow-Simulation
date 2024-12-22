export type StageStatus = 'idle' | 'running' | 'success' | 'failed'

export interface PipelineStage {
  id: string
  name: string
  status: StageStatus
  description: string
  duration?: string
  logs?: string[]
}

export interface PipelineState {
  stages: PipelineStage[]
  currentStage: string | null
  isRunning: boolean
}

