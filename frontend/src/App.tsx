// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import SignUp from './pages/auth/SignUp'
// import SignIn from './pages/auth/SignIn'
// import Dashboard from './pages/Dashboard'
// import './App.css'

// function App() {

//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="/signup" element={<SignUp />} />
//           <Route path="/login" element={<SignIn />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//       </BrowserRouter>
//     </>
//   )
// }

// export default App


import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/users/AllUsers";
import Login from "./pages/auth/SignIn";
import CustomersList from './pages/customers/AllCustomers';
import AddCustomer from './pages/customers/AddCustomer';
import ViewCustomer from './pages/customers/ViewCustomer'
import EditCustomer from "./pages/customers/EditCustomer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />

            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/customers/view/:id" element={<ViewCustomer />} />
            <Route path="/customers/edit/:id" element={<EditCustomer />} />

          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App