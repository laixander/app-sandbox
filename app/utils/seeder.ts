import { faker } from '@faker-js/faker'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
}

export const SeederService = {
  generateUsers(count: number = 5): User[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: faker.person.jobTitle(),
    }))
  },
  clearUsers(): User[] {
    return []
  }
}