"use client"

import { Button } from "@/components/ui/button"
import { PipelineProvider, usePipeline } from "./context/pipeline-context"
import { StageNode } from "./components/stage-node"
import { StageConnector } from "./components/stage-connector"
import { StageDetails } from "./components/stage-details"

function PipelineContent() {
  const { state, startPipeline, resetPipeline } = usePipeline()
  const currentStage = state.stages.find(s => s.id === state.currentStage)

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CI/CD Pipeline Visualization</h1>
          <div className="space-x-4">
            <Button
              onClick={startPipeline}
              disabled={state.isRunning}
            >
              Start Pipeline
            </Button>
            <Button
              onClick={resetPipeline}
              variant="outline"
              disabled={state.isRunning}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            {state.stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center flex-1">
                <StageNode
                  stage={stage}
                  isActive={stage.id === state.currentStage}
                />
                {index < state.stages.length - 1 && (
                  <StageConnector
                    isActive={
                      state.stages[index + 1].id === state.currentStage ||
                      stage.status === "success"
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {currentStage && (
            <div className="mt-8">
              <StageDetails stage={currentStage} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Pipeline() {
  return (
    <PipelineProvider>
      <PipelineContent />
    </PipelineProvider>
  )
}

