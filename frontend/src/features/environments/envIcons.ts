import { Cloud, FlaskConical, Laptop } from 'lucide-react'

export const envIcon = {
  development: { Icon: Laptop, tone: 'bg-obs-selected text-cobalt' },
  staging: { Icon: FlaskConical, tone: 'bg-mint/60 text-[#1f6b4d]' },
  production: { Icon: Cloud, tone: 'bg-[#E4E8EE] text-[#1B2A4A]' },
} as const
