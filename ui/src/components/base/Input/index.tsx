import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`
        w-full rounded-lg border border-gray-300 
        bg-white px-3 py-2 text-sm text-gray-600
        placeholder-gray-400 focus:outline-none
        focus:ring-1 focus:ring-purple-500 focus:border-purple-500
        disabled:bg-gray-100 disabled:cursor-not-allowed 
        ${className}`}
      ref={ref}
      {...props}
    />
  )
})
