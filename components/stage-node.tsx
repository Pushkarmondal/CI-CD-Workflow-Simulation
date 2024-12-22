"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { AlertCircle, CheckCircle, Circle, Loader2 } from 'lucide-react'
import type { PipelineStage } from "../types/pipeline"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StageNodeProps {
  stage: PipelineStage
  isActive: boolean
}

export function StageNode({ stage, isActive }: StageNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && nodeRef.current) {
      gsap.to(nodeRef.current, {
        scale: 1.1,
        duration: 0.3,
        repeat: -1,
        yoyo: true
      })
    } else if (nodeRef.current) {
      gsap.to(nodeRef.current, {
        scale: 1,
        duration: 0.3
      })
    }
  }, [isActive])

  const getStatusIcon = () => {
    switch (stage.status) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "failed":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case "running":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      default:
        return <Circle className="h-6 w-6 text-gray-400" />
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            ref={nodeRef}
            className={`
              flex items-center justify-center p-4 rounded-full
              ${isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}
              transition-colors duration-200
            `}
          >
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <h3 className="font-bold">{stage.name}</h3>
            <p className="text-sm text-gray-500">{stage.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

