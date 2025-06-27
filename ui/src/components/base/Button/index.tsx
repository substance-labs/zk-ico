import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, disabled = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        bg-purple-500
        hover:bg-purple-600
        active:bg-purple-700
        focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2
        text-white font-semibold
        py-3 px-5 rounded-full
        transition ease-in-out duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  )
}
