// import express from 'express'
// import cors from 'cors'
// import mysql from 'mysql2/promise'
// import 'dotenv/config'
// import app from './app'

// const app = express()

// app.use(cors())
// app.use(express.json())

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// })

// app.get('/', (_req, res) => {
//   res.json({ message: 'Backend is running!' })
// })

// app.get('/api/users', async (_req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM users')
//     res.json(rows)
//   } catch {
//     res.status(500).json({ error: 'Database query failed' })
//   }
// })

// const PORT = Number(process.env.PORT) || 5000

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })




import 'dotenv/config'
import app from './app'

const PORT = Number(process.env.PORT ?? 4000)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})