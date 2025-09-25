import dotenv from 'dotenv'

// força carregar .env da raiz
dotenv.config({ path: './.env' })

console.log('DATABASE_URL =', process.env.DATABASE_URL)
