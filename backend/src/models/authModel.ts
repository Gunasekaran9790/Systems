import { db } from '../config/db'
import type { ResultSetHeader } from 'mysql2'

interface CreateUserInput {
  name: string
  email: string
  passwordHash: string
}

export async function createUser(input: CreateUserInput) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO users (name, email, password_hash)
     VALUES (?, ?, ?)`,
    [input.name, input.email, input.passwordHash],
  )

  return result.insertId
}