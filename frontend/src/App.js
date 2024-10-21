import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import MyProjectsPage from './pages/MyProjectsPage/MyProjectsPage';
import FormPage from './pages/FormPage/FormPage';
import ProjectViewPage from './pages/ProjectViewPage/ProjectViewPage';
import EditUserPage from './pages/EditUserPage/EditUserPage';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/projects" element={<MyProjectsPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/project-page" element={<ProjectViewPage />} />
        <Route path="/edit-user/:userId" element={<EditUserPage />} /> {/* Dynamic user ID */}
      </Routes>
    </Router>
  );
}

export default App;
