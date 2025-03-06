import Link from "next/link"
import { Button } from "@/components/ui/button"
import { nanoid } from "nanoid"

export default function Home() {
  // Generate a random room ID
  const createRoom = () => {
    const roomId = nanoid(10)
    return roomId
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Cursor Party</h1>
          <p className="text-slate-500">Share your cursor with friends in real-time</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Link href={`/room/${createRoom()}`} prefetch={false}>
            <Button size="lg" className="w-full">
              Create a new room
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-b from-slate-50 to-slate-100 px-2 text-slate-500">or join existing</span>
            </div>
          </div>

          <div className="text-sm text-slate-500">Enter a room ID or use a shared link to join an existing room</div>
        </div>
      </div>
    </main>
  )
}

