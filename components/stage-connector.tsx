"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface StageConnectorProps {
  isActive: boolean
}

export function StageConnector({ isActive }: StageConnectorProps) {
  const connectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && connectorRef.current) {
      gsap.fromTo(connectorRef.current,
        { width: "0%" },
        { width: "100%", duration: 1, ease: "power1.inOut" }
      )
    } else if (connectorRef.current) {
      gsap.to(connectorRef.current, {
        width: "100%",
        duration: 0.3
      })
    }
  }, [isActive])

  return (
    <div className="flex-1 px-2">
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          ref={connectorRef}
          className={`h-full rounded-full transition-colors duration-200
            ${isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
          `}
          style={{ width: "0%" }}
        />
      </div>
    </div>
  )
}

