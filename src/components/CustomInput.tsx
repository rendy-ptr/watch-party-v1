'use client'
import { InputHTMLAttributes } from 'react'

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function CustomInput({ label, ...props }: CustomInputProps) {
  return (
    <div className="relative w-full group">
      {label && (
        <label className="block mb-2 text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full px-4 py-4 rounded-xl bg-white/10 text-white placeholder-white/60
                   border border-white/20
                   focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-sky-300
                   transition-all duration-300 backdrop-blur-md
                   group-hover:border-cyan-200/40 group-hover:shadow-lg group-hover:shadow-sky-400/10"
      />
      <div
        className="absolute inset-0 rounded-xl pointer-events-none border border-transparent
                      group-focus-within:border-sky-300/50
                      group-hover:border-cyan-200/30 transition-all duration-500"
      ></div>
    </div>
  )
}
