import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

import { signupUser } from '../../api/authAPI'
import type { SignupForm } from '../../types/authTypes'

const initialForm: SignupForm = {
  name: '',
  email: '',
  password: '',
}

const SignUp = () => {
  const [form, setForm] = useState<SignupForm>(initialForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (form.password.length < 12) {
      setMessage('Password must be at least 12 characters.')
      setIsError(true)
      return
    }

    try {
      setLoading(true)

      const response = await signupUser(form)

      setMessage(response.message)
      setForm(initialForm)
    } catch (error: unknown) {
      setIsError(true)

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        setMessage(error.message)
      } else {
        setMessage('Unable to connect to the server.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Create Account
        </h1>

        <p className="pb-4 mb-6 text-center text-gray-500">
          Sign up to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-left mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-left mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-left mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-4 text-center text-sm ${
              isError ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}

        {/* <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Log in
          </a>
        </p> */}
      </div>
    </div>
  )
}

export default SignUp