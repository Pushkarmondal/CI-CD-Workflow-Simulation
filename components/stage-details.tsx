"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { PipelineStage } from "../types/pipeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StageDetailsProps {
  stage: PipelineStage
}

export function StageDetails({ stage }: StageDetailsProps) {
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (detailsRef.current) {
      gsap.from(detailsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.3
      })
    }
  }, [stage])

  return (
    <Card ref={detailsRef}>
      <CardHeader>
        <CardTitle>{stage.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Status</h4>
            <p className="text-sm capitalize">{stage.status}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm">{stage.description}</p>
          </div>
          {stage.logs && (
            <div>
              <h4 className="text-sm font-medium">Logs</h4>
              <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                <code className="text-white text-sm">
                  {stage.logs.join('\n')}
                </code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

