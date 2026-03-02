import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

test('renders home heading', () => {
  render(<Home />);
  expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
});
