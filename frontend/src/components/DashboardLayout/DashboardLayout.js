import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  GridViewRounded as OverviewIcon,
  Settings as SettingsIcon,
  InsertChartRounded as ChartIcon,
} from '@mui/icons-material';

const baseNavigation = [
  {
    segment: 'my-projects-page',
    title: 'Dashboard',
    icon: <OverviewIcon />,
  },
];

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  palette: {
    mode: 'dark',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DashboardLayoutWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();  // Capture the projectId from the URL

  const [session, setSession] = useState(null);
  const [navigation, setNavigation] = useState(baseNavigation);

  // Check for user session from cookies
  useEffect(() => {
    const userId = Cookies.get('userId');
    if (userId) {
      setSession({
        user: {
          name: userId,
          email: userId, // Or fetch the actual email
          image: '', // Add user's image URL if available
        },
      });
    }
  }, []);

  const authentication = useMemo(() => {
    return {
      signIn: (user) => {
        setSession({ user });
        Cookies.set('userId', user.name, { expires: 1 });
      },
      signOut: () => {
        setSession(null);
        Cookies.remove('userId');
        navigate('/'); // Redirect to login after signing out
      },
    };
  }, [navigate]);

  const handleEditProfile = () => {
    navigate(`/edit-user/${session?.user?.name}`); // Navigate to the Edit Profile page
  };

  const router = {
    pathname: location.pathname,
    navigate: (path, options) => navigate(path, options),
  };

  // Dynamically populate the navigation for the project page
  useEffect(() => {
    if (location.pathname.startsWith('/project-page') && projectId) {
      // Add "Overview" and "Settings" relative to the specific project page
      setNavigation([
        ...baseNavigation,
        { kind: 'divider' },
        { kind: 'header', title: 'My Project' },
        { segment: `project-page/${projectId}/overview`, title: 'Summary', icon: <ChartIcon /> },
        { segment: `project-page/${projectId}/settings`, title: 'Settings', icon: <SettingsIcon /> },
        { segment: `project-page/${projectId}/graphs`, title: 'Settings', icon: <ChartIcon /> },
      ]);
    } else {
      // Revert back to base navigation when leaving "/project-page"
      setNavigation(baseNavigation);
    }
  }, [location.pathname, projectId]);

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={navigation} // Pass the dynamic navigation
      branding={{
        title: 'CaseFlow',
      }}
      router={router}
      theme={theme}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <Outlet />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutWrapper.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutWrapper;
