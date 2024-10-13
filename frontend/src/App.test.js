import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders login page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const loginHeader = screen.getByText(/login/i);  // Adjust according to content in your LoginPage
  expect(loginHeader).toBeInTheDocument();
});
