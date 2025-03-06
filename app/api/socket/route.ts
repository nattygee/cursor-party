import { Server as SocketIOServer } from "socket.io"
import type { NextRequest } from "next/server"

let io: SocketIOServer

// Store cursor positions by room
const cursors: Record<string, Record<string, any>> = {}

export async function GET(req: NextRequest) {
  if (!io) {
    // @ts-expect-error - The types don't match perfectly, but this works
    io = new SocketIOServer(req.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    })

    io.on("connection", (socket) => {
      const roomId = socket.handshake.query.roomId as string
      const userId = socket.handshake.query.userId as string
      const color = socket.handshake.query.color as string

      // Initialize room if it doesn't exist
      if (!cursors[roomId]) {
        cursors[roomId] = {}
      }

      // Add user to room
      socket.join(roomId)

      // Initialize cursor position
      cursors[roomId][userId] = {
        userId,
        x: 0.5,
        y: 0.5,
        color,
      }

      // Broadcast updated cursors to room
      io.to(roomId).emit("cursor-update", cursors[roomId])

      // Handle cursor movement
      socket.on("cursor-move", (data) => {
        if (cursors[roomId] && cursors[roomId][data.userId]) {
          cursors[roomId][data.userId] = data
          io.to(roomId).emit("cursor-update", cursors[roomId])
        }
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        if (cursors[roomId]) {
          delete cursors[roomId][userId]

          // Remove room if empty
          if (Object.keys(cursors[roomId]).length === 0) {
            delete cursors[roomId]
          } else {
            io.to(roomId).emit("cursor-update", cursors[roomId])
          }
        }
      })
    })
  }

  return new Response("Socket is running", {
    status: 200,
  })
}

