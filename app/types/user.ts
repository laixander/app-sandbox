export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: 'Active' | 'Inactive'
}
