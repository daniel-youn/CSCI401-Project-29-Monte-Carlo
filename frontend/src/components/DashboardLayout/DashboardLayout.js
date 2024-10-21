// DashboardLayout.js
import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Logout } from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';

const NAVIGATION = [
  {
    segment: 'my-projects-page',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
];

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  palette: {
    mode: 'dark', // Choose 'light' or 'dark'
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

  const [session, setSession] = useState(null);

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

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      branding={{
        title: 'CaseFlow',
      }}
      router={router}
      theme={theme}
    >
      <DashboardLayout
        defaultSidebarCollapsed
      >
        <Outlet />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutWrapper.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutWrapper;
