import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

export const useWebsocket = () => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined)

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })
    setSocket(socket)

    socket.on('connect', () => {
      console.log('connected')
    })
    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('connect_error:', err.message, err)
    })
    socket.on('error', (err) => {
      console.error('socket error:', err)
    })

    return () => {
      socket.close()
    }
  }, [])

  return { socket }
}
