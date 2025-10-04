"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface VotingButtonsProps {
  upvotes: number
  downvotes: number
  userVote: "up" | "down" | null
  onVote: (voteType: "up" | "down") => void
  disabled?: boolean
  loading?: boolean
}

export function VotingButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  disabled = false,
  loading = false,
}: VotingButtonsProps) {
  const [animatingUp, setAnimatingUp] = useState(false)
  const [animatingDown, setAnimatingDown] = useState(false)

  const handleUpvote = () => {
    if (disabled || loading) return
    setAnimatingUp(true)
    onVote("up")
    setTimeout(() => setAnimatingUp(false), 600)
  }

  const handleDownvote = () => {
    if (disabled || loading) return
    setAnimatingDown(true)
    onVote("down")
    setTimeout(() => setAnimatingDown(false), 600)
  }

  const netVotes = upvotes - downvotes

  return (
    <div className="flex flex-col items-center gap-2">
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
          75% { transform: rotate(1deg); }
        }
        
        @keyframes shake-down {
          0%, 100% { transform: rotate(180deg); }
          25% { transform: rotate(183deg); }
          50% { transform: rotate(177deg); }
          75% { transform: rotate(181deg); }
        }
        
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes firework {
          0% { 
            box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white;
            opacity: 1;
          }
          100% { 
            box-shadow: 
              20px -20px #22c55e, -20px -20px #22c55e, 
              20px 20px #22c55e, -20px 20px #22c55e,
              30px 0 #22c55e, -30px 0 #22c55e,
              0 30px #22c55e, 0 -30px #22c55e;
            opacity: 0;
          }
        }
        
        @keyframes firework-down {
          0% { 
            box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white;
            opacity: 1;
          }
          100% { 
            box-shadow: 
              20px -20px #ef4444, -20px -20px #ef4444, 
              20px 20px #ef4444, -20px 20px #ef4444,
              30px 0 #ef4444, -30px 0 #ef4444,
              0 30px #ef4444, 0 -30px #ef4444;
            opacity: 0;
          }
        }
        
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }
        
        .shake-down-animation {
          animation: shake-down 0.5s ease-in-out;
        }
        
        .pop-animation {
          animation: pop 0.3s ease-out;
        }
        
        .firework-effect {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: firework 0.6s ease-out forwards;
        }
        
        .firework-down-effect {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: firework-down 0.6s ease-out forwards;
        }
      `}</style>

      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        disabled={disabled || loading}
        className={`
          relative group
          flex items-center justify-center
          w-14 h-14 rounded-full
          transition-all duration-200
          ${
            userVote === "up"
              ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200 scale-105"
              : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-green-50 hover:to-green-100 hover:shadow-md"
          }
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}
          border-2 ${userVote === "up" ? "border-green-300" : "border-gray-300 hover:border-green-300"}
        `}
      >
        <ThumbsUp
          className={`
            w-6 h-6 transition-all duration-200
            ${userVote === "up" ? "text-white fill-white" : "text-gray-600 group-hover:text-green-600"}
            ${animatingUp && !userVote ? "shake-animation" : ""}
            ${userVote === "up" ? "pop-animation" : ""}
          `}
        />
        {animatingUp && userVote === "up" && (
          <div className="firework-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </button>

      {/* Vote Count */}
      <div
        className={`
        flex items-center justify-center
        min-w-[60px] px-3 py-2
        rounded-xl font-bold text-lg
        transition-all duration-200
        ${
          netVotes > 0
            ? "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-2 border-green-200"
            : netVotes < 0
              ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-2 border-red-200"
              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300"
        }
        shadow-sm
      `}
      >
        {netVotes > 0 ? `+${netVotes}` : netVotes}
      </div>

      {/* Downvote Button */}
      <button
        onClick={handleDownvote}
        disabled={disabled || loading}
        className={`
          relative group
          flex items-center justify-center
          w-14 h-14 rounded-full
          transition-all duration-200
          ${
            userVote === "down"
              ? "bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-200 scale-105"
              : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 hover:shadow-md"
          }
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}
          border-2 ${userVote === "down" ? "border-red-300" : "border-gray-300 hover:border-red-300"}
        `}
      >
        <ThumbsDown
          className={`
            w-6 h-6 transition-all duration-200
            ${userVote === "down" ? "text-white fill-white" : "text-gray-600 group-hover:text-red-600"}
            ${animatingDown && !userVote ? "shake-down-animation" : ""}
            ${userVote === "down" ? "pop-animation" : ""}
          `}
        />
        {animatingDown && userVote === "down" && (
          <div className="firework-down-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </button>
    </div>
  )
}
