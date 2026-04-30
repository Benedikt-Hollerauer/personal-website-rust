export interface Project {
  id: number
  title?: string
  description?: string
  link?: string
  location?: string
  key_points?: Record<string, unknown>
  start_date?: string
  end_date?: string
  active: boolean
  order: number
  created_at: string
  updated_at: string
}
