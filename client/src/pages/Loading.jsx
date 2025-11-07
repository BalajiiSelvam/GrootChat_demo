import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const {fetchUser} = useAppContext()

  // Navigate after 8 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUser()
      navigate('/')
    }, 8000)
    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Dark logo */}
      <img
        src={assets.logo_full_dark}
        alt="App Logo"
        className="w-50 sm:w-62 drop-shadow-xl"
      />

      {/* Animated black dots */}
      <div className="flex gap-2 mt-8">
        <span className="w-3 h-3 bg-black rounded-full animate-bounce delay-0"></span>
        <span className="w-3 h-3 bg-black rounded-full animate-bounce delay-150"></span>
        <span className="w-3 h-3 bg-black rounded-full animate-bounce delay-300"></span>
      </div>

      {/* Keyframes for animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-12px); }
          }
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          .delay-0 { animation-delay: 0s; }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }
        `}
      </style>
    </div>
  )
}

export default Loading
