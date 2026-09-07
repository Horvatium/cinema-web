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

// Korenska komponenta: sestavi ovojnice (stanje prijave, usmerjevalnik) ter
// določi, katera stran se izriše pri katerem naslovu.
function App() {
    return (
        // AuthProvider je zunaj usmerjevalnika, da je podatek o prijavljenem
        // uporabniku na voljo tudi navigacijski vrstici in nogi
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <main>
                <div className="container">
                    <Routes>
                        {/* Javne strani, dostopne brez prijave */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/films/:id" element={<FilmDetail />
                    } />
                        <Route path="/program" element={<Program />} />

                        {/* Zaščiteni strani: ProtectedRoute neprijavljenega
                            preusmeri na prijavo, adminOnly pa navadno stranko
                            vrne na domačo stran */}
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