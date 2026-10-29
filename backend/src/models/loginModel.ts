import db from '../config/db'

export interface LoginUser {
  id: number
  name: string
  email: string
  password_hash: string
}

export async function findUserByEmail(
  email: string,
): Promise<LoginUser | null> {
  const [rows] = await db.execute(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  )

  const users = rows as LoginUser[]

  return users[0] ?? null
}

export async function findUserById(
  id: number,
): Promise<LoginUser | null> {
  const [rows] = await db.execute(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  )

  const users = rows as LoginUser[]

  return users[0] ?? null
}