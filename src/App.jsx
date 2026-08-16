import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Blog from './pages/Blog';

// Wrapper that blocks unauthenticated users from protected pages
const PrivateRoute = ({ children }) =>
    localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

export default function App() {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/blog" element={<PrivateRoute><Blog /></PrivateRoute>} />
            </Routes>
        </>
    );
}
