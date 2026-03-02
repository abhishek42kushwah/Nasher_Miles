import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

test('renders AuthForm and submits values', () => {
  const handle = jest.fn();
  render(<AuthForm onSubmit={handle} showName />);

  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Sam' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });

  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(handle).toHaveBeenCalledWith({ name: 'Sam', email: 'a@b.com', password: 'secret' });
});
