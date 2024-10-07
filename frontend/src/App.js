import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import MyProjectsPage from './pages/MyProjectsPage/MyProjectsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Route for Registration Page */}
        <Route path="/register" element={<RegistrationPage />} />

        {/* Route for My Projects Page */}
        <Route path="/projects" element={<MyProjectsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
