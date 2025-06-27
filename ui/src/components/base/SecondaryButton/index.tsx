import React from "react"
import { type LucideIcon } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  Icon: LucideIcon
  withBackground?: boolean
}

export default function SecondaryButton({
  children,
  disabled = false,
  className = "",
  Icon,
  withBackground = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        group flex items-center space-x-3 py-2 pr-4
        rounded-xl           
        transition-colors duration-150
        cursor-pointer
         ${withBackground ? "bg-purple-100" : "hover:bg-purple-50"}
        ${className}
      `}
    >
      <Icon className="w-5 h-5 text-gray-600 ransition-colors duration-150 ml-3" />
      <span>{children}</span>
    </button>
  )
}
