import * as dotenv from 'dotenv'
dotenv.config()

if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set in .env. Prisma commands may fail to connect to the database.')
}

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
