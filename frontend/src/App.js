import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import FormPage from './pages/FormPage/FormPage';
import ProjectViewPage from './pages/ProjectViewPage/ProjectViewPage';
import CreateProjectPage from './pages/CreateProjectPage/CreateProjectPage';
import MyProjectsPage from './pages/MyProjectsPage/MyProjectsPage';
import EditUserPage from './pages/EditUserPage/EditUserPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected routes wrapped with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/form" element={<FormPage />} />
          <Route path="/project-page" element={<ProjectViewPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/my-projects-page" element={<MyProjectsPage />} />
          <Route path="/edit-user/:userId" element={<EditUserPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
