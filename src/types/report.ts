export type ReportType    = 'lost' | 'found'
export type AnimalSpecies = 'dog' | 'cat' | 'other'
export type AnimalSize    = 'small' | 'medium' | 'large'
export type ReportStatus  = 'active' | 'resolved'

export interface Report {
  id: string
  type: ReportType
  species: AnimalSpecies
  size: AnimalSize
  color: string
  description: string | null
  photo_url: string | null
  name: string | null
  latitude: number
  longitude: number
  status: ReportStatus
  contact_name: string
  contact_phone: string
  contact_email: string | null
  occurred_at: string
  created_at: string
}