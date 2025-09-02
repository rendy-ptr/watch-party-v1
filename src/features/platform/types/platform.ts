export interface Platform {
  id: string
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  isActive: boolean
  description: string
  url: string
}
