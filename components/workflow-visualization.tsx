"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, PlayCircle, StopCircle } from 'lucide-react'
import { gsap } from "gsap"

const LOGOS = {
  gitlab: "https://about.gitlab.com/images/press/logo/svg/gitlab-icon-rgb.svg",
  vscode: "https://code.visualstudio.com/assets/images/code-stable.png",
  sonarqube: "https://cdn.worldvectorlogo.com/logos/sonarqube-1.svg",
  eslint: "https://eslint.org/icon-512.png",
  kubernetes: "https://kubernetes.io/images/nav_logo2.svg",
  argocd: "https://argo-cd.readthedocs.io/en/stable/assets/logo.png",
  trivy: "https://aquasecurity.github.io/trivy/v0.18.3/imgs/logo.png",
  docker: "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png",
  prometheus: "https://prometheus.io/assets/favicon.ico",
  grafana: "https://grafana.com/static/img/menu/grafana2.svg",
}

type StageStatus = 'idle' | 'running' | 'completed'

interface Stage {
  id: string
  title: string
  description: string
  tools: Array<keyof typeof LOGOS>
  status: StageStatus
  detailedDescription: string
  workingDetails: string
}

const STAGES: Stage[] = [
  {
    id: "development",
    title: "Development",
    description: "Developers work on feature branches and create merge requests",
    tools: ["gitlab", "vscode"],
    status: 'idle',
    detailedDescription: "In this stage, developers use GitLab for version control and VS Code as their primary IDE. They create feature branches to work on new features or bug fixes.",
    workingDetails: "Developers clone the repository, create a new branch, make changes, commit their work, and push to GitLab. They then create a merge request for code review."
  },
  {
    id: "code-quality",
    title: "Code Quality",
    description: "Static code analysis and code style checks using SonarQube",
    tools: ["sonarqube", "eslint"],
    status: 'idle',
    detailedDescription: "SonarQube performs static code analysis to identify bugs, vulnerabilities, and code smells. ESLint ensures consistent code style and catches potential errors.",
    workingDetails: "The CI pipeline runs SonarQube and ESLint on every merge request. Issues are reported back to the developers for resolution before merging."
  },
  {
    id: "unit-tests",
    title: "Unit Tests",
    description: "Automated unit testing with Jest",
    tools: ["gitlab"],
    status: 'idle',
    detailedDescription: "Unit tests are run to ensure individual components of the application work as expected. This helps catch bugs early in the development process.",
    workingDetails: "Jest runs all unit tests defined in the project. The CI pipeline executes these tests and reports results back to GitLab, blocking merges if tests fail."
  },
  {
    id: "staging",
    title: "Staging Deploy",
    description: "Automated deployment to staging environment using GitLab CD",
    tools: ["kubernetes", "argocd"],
    status: 'idle',
    detailedDescription: "Once tests pass, the application is automatically deployed to a staging environment for further testing and validation.",
    workingDetails: "GitLab CD triggers a deployment to a Kubernetes cluster using ArgoCD. This ensures the staging environment closely mirrors production."
  },
  {
    id: "security",
    title: "Security Scan",
    description: "Scan Docker images for vulnerabilities using Trivy",
    tools: ["trivy"],
    status: 'idle',
    detailedDescription: "Trivy scans Docker images for known vulnerabilities in the application and its dependencies, helping to identify and mitigate security risks.",
    workingDetails: "The CI pipeline runs Trivy against the built Docker images. Any detected vulnerabilities are reported and must be addressed before proceeding to production."
  },
  {
    id: "build",
    title: "Build",
    description: "Build Docker images and prepare for deployment",
    tools: ["docker"],
    status: 'idle',
    detailedDescription: "Docker images are built containing the application and its dependencies, ensuring consistency across different environments.",
    workingDetails: "The Dockerfile is used to build an image, which is then tagged and pushed to the GitLab container registry for later use in deployment."
  },
  {
    id: "production",
    title: "Production Deploy",
    description: "GitOps-based deployment to production using ArgoCD",
    tools: ["argocd", "kubernetes"],
    status: 'idle',
    detailedDescription: "After passing all previous stages, the application is deployed to the production environment using a GitOps approach with ArgoCD.",
    workingDetails: "ArgoCD monitors the GitLab repository for changes. When a new version is approved, it automatically updates the production Kubernetes cluster to match the desired state."
  },
  {
    id: "monitoring",
    title: "Monitoring",
    description: "Application and infrastructure monitoring",
    tools: ["prometheus", "grafana"],
    status: 'idle',
    detailedDescription: "Continuous monitoring of the application and infrastructure helps detect and respond to issues quickly.",
    workingDetails: "Prometheus collects metrics from the application and Kubernetes cluster. Grafana provides dashboards for visualizing these metrics and setting up alerts."
  }
]

interface StagePosition {
  x: number
  y: number
  connections: string[]
}

const STAGE_POSITIONS: Record<string, StagePosition> = {
  "development": { x: 100, y: 50, connections: ["code-quality", "unit-tests", "security"] },
  "code-quality": { x: 400, y: 0, connections: ["staging"] },
  "unit-tests": { x: 400, y: 150, connections: ["staging"] },
  "security": { x: 400, y: 300, connections: ["build"] },
  "staging": { x: 700, y: 75, connections: ["production"] },
  "build": { x: 700, y: 300, connections: ["production"] },
  "production": { x: 1000, y: 150, connections: ["monitoring"] },
  "monitoring": { x: 1300, y: 150, connections: [] }
}

const StageCard = ({ stage, status, isActive }: { 
  stage: Stage
  status: StageStatus
  isActive: boolean 
}) => {
  return (
    <div
      className={`
        relative w-64 p-4 rounded-lg backdrop-blur-sm
        border-2 transition-all duration-500
        ${isActive ? 'border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.5)]' : 'border-[#1a472a]'}
        ${status === 'completed' ? 'border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.3)]' : ''}
        bg-[rgba(0,12,24,0.8)]
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">{stage.title}</h2>
        <StatusIcon status={status} />
      </div>
      <p className="text-xs text-blue-100 mb-2">
        {stage.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {stage.tools.map((tool) => (
          <Badge
            key={tool}
            variant="secondary"
            className="flex items-center gap-1 bg-[rgba(0,255,0,0.1)] text-[#00ff00] border border-[#00ff00] text-xs"
          >
            <img
              src={LOGOS[tool]}
              alt={tool}
              className="h-3 w-3 object-contain"
            />
            {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  )
}

const StatusIcon = ({ status }: { status: StageStatus }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-5 h-5 rounded-full bg-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.5)] flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#001a00]" />
        </div>
      )
    case 'running':
      return <Loader2 className="h-5 w-5 text-[#00ff00] animate-spin" />
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-[#1a472a]" />
  }
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      opacity: Math.random()
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        star.opacity = Math.sin(Date.now() / 1000 + star.x) * 0.5 + 0.5
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-[#000C18]"
    />
  )
}

const ConnectionLines = ({ stages, activeStage }: { 
  stages: Stage[]
  activeStage: string | null 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    Object.entries(STAGE_POSITIONS).forEach(([fromId, position]) => {
      position.connections.forEach(toId => {
        const fromPos = STAGE_POSITIONS[fromId]
        const toPos = STAGE_POSITIONS[toId]
        
        const path = document.querySelector(`#path-${fromId}-${toId}`)
        if (!path) return

        const isActive = activeStage === toId
        const isCompleted = stages.find(s => s.id === fromId)?.status === 'completed'

        gsap.to(path, {
          strokeDashoffset: 0,
          stroke: isActive || isCompleted ? '#ffff00' : '#1a472a',
          duration: 1,
          ease: "power1.inOut"
        })
      })
    })
  }, [stages, activeStage])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ minWidth: '1500px' }}
    >
      {Object.entries(STAGE_POSITIONS).map(([fromId, position]) =>
        position.connections.map(toId => {
          const fromPos = STAGE_POSITIONS[fromId]
          const toPos = STAGE_POSITIONS[toId]
          
          const path = `M ${fromPos.x + 128} ${fromPos.y + 32} 
                       C ${fromPos.x + 200} ${fromPos.y + 32},
                         ${toPos.x - 72} ${toPos.y + 32},
                         ${toPos.x} ${toPos.y + 32}`

          return (
            <path
              key={`${fromId}-${toId}`}
              id={`path-${fromId}-${toId}`}
              d={path}
              fill="none"
              stroke="#1a472a"
              strokeWidth="3"
              strokeDasharray="5"
              strokeDashoffset="5"
              className="transition-colors duration-500"
            />
          )
        })
      )}
    </svg>
  )
}

const ArrowIcon = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CompletedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" fill="#4C1D95" />
    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function WorkflowVisualization() {
  const [stages, setStages] = useState<Stage[]>(STAGES)
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)

  const startSimulation = () => {
    setIsSimulating(true)
    setCurrentStageIndex(0)
    setStages(STAGES.map(stage => ({ ...stage, status: 'idle' })))
    simulateNextStage(0)
  }

  const simulateNextStage = (index: number) => {
    if (index >= stages.length) {
      setIsSimulating(false)
      setCurrentStageIndex(-1)
      return
    }

    setStages(prev => prev.map((stage, i) => ({
      ...stage,
      status: i === index ? 'running' : stage.status
    })))

    setTimeout(() => {
      setStages(prev => prev.map((stage, i) => ({
        ...stage,
        status: i === index ? 'completed' : stage.status
      })))
      setCurrentStageIndex(index + 1)
      simulateNextStage(index + 1)
    }, 2000)
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    setCurrentStageIndex(-1)
    setStages(STAGES.map(stage => ({ ...stage, status: 'idle' })))
  }

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-auto overflow-y-hidden">
      <StarryBackground />
      
      <div className="relative z-10 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 text-[#00ff00]">
              CI/CD Workflow Visualization
            </h1>
            <p className="text-[#00cc00] mb-6">
              A comprehensive view of the modern CI/CD pipeline
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={startSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 bg-[rgba(0,255,0,0.1)] text-[#00ff00] border border-[#00ff00] hover:bg-[rgba(0,255,0,0.2)]"
              >
                <PlayCircle className="h-5 w-5" />
                Start Simulation
              </Button>
              <Button
                onClick={stopSimulation}
                disabled={!isSimulating}
                variant="outline"
                className="flex items-center gap-2 border-[#ff0000] text-[#ff0000] hover:bg-[rgba(255,0,0,0.1)]"
              >
                <StopCircle className="h-5 w-5" />
                Stop Simulation
              </Button>
            </div>
          </div>

          <div className="relative min-w-[1500px] h-[400px]">
            <ConnectionLines 
              stages={stages} 
              activeStage={stages[currentStageIndex]?.id ?? null} 
            />
            
            {stages.map((stage) => {
              const position = STAGE_POSITIONS[stage.id]
              if (!position) return null

              return (
                <Dialog key={stage.id}>
                  <DialogTrigger asChild>
                    <div
                      style={{
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                      }}
                    >
                      <StageCard
                        stage={stage}
                        status={stage.status}
                        isActive={stage.id === stages[currentStageIndex]?.id}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[rgba(0,12,24,0.95)] border-[#00ff00] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-[#00ff00]">{stage.title}</DialogTitle>
                      <DialogDescription className="text-[#00cc00]">
                        {stage.detailedDescription}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-[#00ff00]">How it works:</h4>
                      <p className="text-sm text-[#00cc00]">
                        {stage.workingDetails}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-[#00ff00]">Tools used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.tools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="secondary"
                            className="flex items-center gap-1 bg-[rgba(0,255,0,0.1)] text-[#00ff00] border border-[#00ff00]"
                          >
                            <img
                              src={LOGOS[tool]}
                              alt={tool}
                              className="h-4 w-4 object-contain"
                            />
                            {tool.charAt(0).toUpperCase() + tool.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

