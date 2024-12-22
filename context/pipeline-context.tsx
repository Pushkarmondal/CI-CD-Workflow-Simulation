"use client"

import { createContext, useContext, useState } from "react"
import type { PipelineStage, PipelineState } from "../types/pipeline"

interface PipelineContextType {
  state: PipelineState
  startPipeline: () => void
  resetPipeline: () => void
  updateStageStatus: (stageId: string, status: PipelineStage['status']) => void
}

const initialStages: PipelineStage[] = [
  {
    id: "commit",
    name: "Code Commit",
    status: "idle",
    description: "Push changes to GitHub/GitLab",
    logs: ["Initializing git push...", "Checking branch status..."]
  },
  {
    id: "build",
    name: "Build",
    status: "idle",
    description: "Build Docker image",
    logs: ["Building Docker image...", "Running tests..."]
  },
  {
    id: "scan-code",
    name: "Code Scan",
    status: "idle",
    description: "SonarQube security scan",
    logs: ["Running code analysis...", "Checking code quality..."]
  },
  {
    id: "scan-image",
    name: "Image Scan",
    status: "idle",
    description: "Trivy container scan",
    logs: ["Scanning Docker image...", "Checking vulnerabilities..."]
  },
  {
    id: "registry",
    name: "Push Registry",
    status: "idle",
    description: "Push to Docker registry",
    logs: ["Pushing to registry...", "Verifying upload..."]
  },
  {
    id: "deploy",
    name: "Deployment",
    status: "idle",
    description: "Deploy to Kubernetes",
    logs: ["Deploying to cluster...", "Checking pod status..."]
  },
  {
    id: "monitor",
    name: "Monitoring",
    status: "idle",
    description: "Prometheus/Grafana",
    logs: ["Starting monitoring...", "Collecting metrics..."]
  }
]

const PipelineContext = createContext<PipelineContextType | undefined>(undefined)

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PipelineState>({
    stages: initialStages,
    currentStage: null,
    isRunning: false
  })

  const startPipeline = () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      currentStage: "commit"
    }))
    simulatePipeline()
  }

  const resetPipeline = () => {
    setState({
      stages: initialStages,
      currentStage: null,
      isRunning: false
    })
  }

  const updateStageStatus = (stageId: string, status: PipelineStage['status']) => {
    setState(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, status } : stage
      )
    }))
  }

  const simulatePipeline = () => {
    const stages = ["commit", "build", "scan-code", "scan-image", "registry", "deploy", "monitor"]
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex >= stages.length) {
        clearInterval(interval)
        setState(prev => ({ ...prev, isRunning: false }))
        return
      }

      const currentStageId = stages[currentIndex]
      updateStageStatus(currentStageId, "running")

      setTimeout(() => {
        updateStageStatus(currentStageId, Math.random() > 0.2 ? "success" : "failed")
        currentIndex++
        if (currentIndex < stages.length) {
          setState(prev => ({ ...prev, currentStage: stages[currentIndex] }))
        }
      }, 2000)
    }, 3000)
  }

  return (
    <PipelineContext.Provider value={{ state, startPipeline, resetPipeline, updateStageStatus }}>
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipeline() {
  const context = useContext(PipelineContext)
  if (!context) throw new Error("usePipeline must be used within PipelineProvider")
  return context
}

