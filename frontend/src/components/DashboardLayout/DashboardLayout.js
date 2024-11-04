import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios'; // Import axios
import {
  GridViewRounded as OverviewIcon,
  Settings as SettingsIcon,
  InsertChartRounded as ChartIcon,
} from '@mui/icons-material';
import LayersIcon from '@mui/icons-material/Layers';

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
  const { projectId } = useParams(); // Capture the projectId from the URL

  const [session, setSession] = useState(null);
  const [navigation, setNavigation] = useState(baseNavigation);
  const [isAdmin, setIsAdmin] = useState(false); // State to track if user is admin

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

  // Fetch user data to determine admin status
  useEffect(() => {
    if (session && session.user && session.user.name) {
      const fetchUserData = async () => {
        try {
          const userId = session.user.name;
          const userResponse = await axios.get(`http://localhost:5001/api/user/users/${userId}`);
          const userData = userResponse.data;
          setIsAdmin(userData.is_admin); // Set admin flag based on user data
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [session]);

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
      // Build the navigation items
      let navItems = [
        ...baseNavigation,
        { kind: 'divider' },
        { kind: 'header', title: 'My Project' },
        { segment: `project-page/${projectId}/overview`, title: 'Summary', icon: <ChartIcon /> },
      ];

      // Only include Overlay if user is admin
      if (isAdmin) {
        navItems.push({
          segment: `project-page/${projectId}/overlay`,
          title: 'Overlay',
          icon: <LayersIcon />,
        });
      }

      // Include Settings for all users
      navItems.push({
        segment: `project-page/${projectId}/settings`,
        title: 'Settings',
        icon: <SettingsIcon />,
      });

      setNavigation(navItems);
    } else {
      // Revert back to base navigation when leaving "/project-page"
      setNavigation(baseNavigation);
    }
  }, [location.pathname, projectId, isAdmin]); // Include isAdmin in dependency array

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
