import React from "react"
import { type LucideIcon } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  Icon?: LucideIcon
  withBackground?: boolean
  iconPosition?: "right" | "left"
}

export default function SecondaryButton({
  children,
  disabled = false,
  className = "",
  Icon,
  withBackground = false,
  iconPosition = "right",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        group flex items-center space-x-2 py-2 px-4
        rounded-xl           
        transition-colors duration-150
        cursor-pointer
         ${withBackground ? "bg-purple-100" : "hover:bg-purple-50"}
        ${className}
      `}
    >
      {Icon && iconPosition === "left" && <Icon className="w-5 h-5 text-gray-600 transition-colors duration-150 " />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon className="w-5 h-5 text-gray-600 transition-colors duration-150 " />}
    </button>
  )
}
