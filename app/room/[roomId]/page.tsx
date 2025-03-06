"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

type CursorPosition = {
  userId: string
  x: number
  y: number
  color: string
}

export default function RoomPage() {
  const { roomId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState("")
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
  const [copied, setCopied] = useState(false)
  const [color] = useState(() => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F033FF",
      "#FF33A8",
      "#33FFF5",
      "#F5FF33",
      "#FF8333",
      "#33FF83",
      "#8333FF",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  })

  useEffect(() => {
    // Generate a random user ID
    const newUserId = Math.random().toString(36).substring(2, 10)
    setUserId(newUserId)

    // Connect to Socket.IO server
    const newSocket = io({
      path: "/api/socket",
      query: {
        roomId,
        userId: newUserId,
        color,
      },
    })

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server")
    })

    newSocket.on("cursor-update", (data: Record<string, CursorPosition>) => {
      setCursors(data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [roomId, color])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!socket || !userId) return

      // Calculate position relative to viewport
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      socket.emit("cursor-move", {
        userId,
        x,
        y,
        color,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [socket, userId, color])

  const copyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Room info overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3 flex items-center gap-3">
          <div className="text-sm font-medium">Room: {roomId as string}</div>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={copyRoomLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "Copied!" : "Copy link"}</span>
          </Button>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3">
          <div className="text-sm">
            <span className="font-medium">{Object.keys(cursors).length}</span> cursor
            {Object.keys(cursors).length !== 1 ? "s" : ""} connected
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-slate-400 max-w-md p-6">
          <h2 className="text-xl font-medium mb-2">Move your cursor around</h2>
          <p>Share this link with friends to see their cursors too!</p>
        </div>
      </div>

      {/* Render all cursors */}
      {Object.values(cursors).map(
        (cursor) =>
          cursor.userId !== userId && (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none"
              style={{
                left: `${cursor.x * 100}%`,
                top: `${cursor.y * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 50,
              }}
            >
              <div
                className="relative"
                style={{
                  transform: "rotate(-45deg)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.0664062 17.2664V0.575C0.0664062 0.437471 0.156877 0.3125 0.252942 0.3125H5.46026C5.55632 0.3125 5.65376 0.382971 5.65376 0.520499V12.3673Z"
                    fill={cursor.color}
                    stroke="white"
                    strokeWidth="0.625"
                  />
                </svg>
                <div
                  className="absolute top-6 left-6 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: cursor.color,
                    color: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  User {cursor.userId.substring(0, 4)}
                </div>
              </div>
            </div>
          ),
      )}
    </main>
  )
}

