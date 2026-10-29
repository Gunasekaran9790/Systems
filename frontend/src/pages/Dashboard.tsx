// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { getCurrentUser } from '../api/loginAPI'

// interface User {
//   id: number
//   name: string
//   email: string
// }

// const Dashboard = () => {
//   const navigate = useNavigate()
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     let active = true

//     getCurrentUser()
//       .then((data) => {
//         if (active) setUser(data.user)
//       })
//       .catch(() => {
//         if (active) {
//           navigate('/login', { replace: true })
//         }
//       })
//       .finally(() => {
//         if (active) setLoading(false)
//       })

//     return () => {
//       active = false
//     }
//   }, [navigate])

//   if (loading) {
//     return <p className="p-8">Loading dashboard...</p>
//   }

//   if (!user) return null

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Welcome, {user.name}!
//         </h1>

//         <p className="mt-3 text-gray-600">
//           You have successfully signed in.
//         </p>

//         <div className="mt-6 rounded-lg bg-blue-50 p-4">
//           <p>
//             <strong>Name:</strong> {user.name}
//           </p>
//           <p className="mt-2">
//             <strong>Email:</strong> {user.email}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard


export default function Dashboard() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900">
        Dashboard
      </h2>

      <p className="mt-2 text-slate-500">
        Welcome back! Here is your dashboard overview.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total Users", value: "48" },
          { label: "Active Sessions", value: "12" },
          { label: "Notifications", value: "3" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200
              bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}