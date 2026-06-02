import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FilmDetail from './pages/FilmDetail';
import MyReservations from './pages/MyReservations';
import Admin from './pages/Admin';
import Program from './pages/Program';
import Footer from './components/Footer';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <main>
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/films/:id" element={<FilmDetail />
                    } />
                        <Route path="/program" element={<Program />} />

                        <Route path="/my-reservations" element={
                            <ProtectedRoute>
                                <MyReservations />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly={true}>
                                <Admin />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
                </main>
                <Footer />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;