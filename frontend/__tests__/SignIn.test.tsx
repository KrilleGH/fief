import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SignIn from '../components/SignIn/SignIn';
import { APIClient } from '../services/api';

const mockLogin = jest.fn();
const mockAPIClient = { login: mockLogin } as unknown as APIClient;

describe('SignIn', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('should validate that email and password are not empty', async () => {
    render(<SignIn api={mockAPIClient} />);

    const submitButton = screen.getByText('auth:signin.signin');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getAllByText('common_errors.field_required')).toHaveLength(2)
    );

    const emailInput = screen.getByLabelText('auth:signin.email');
    expect(emailInput.classList).toContain('border-red-300');

    const passwordInput = screen.getByLabelText('auth:signin.password');
    expect(passwordInput.classList).toContain('border-red-300');
  });

  it('should show error code when API returns a 400 status code', async () => {
    mockLogin.mockRejectedValue({ isAxiosError: true, response: { status: 400, data: { detail: 'ERROR_CODE' } } });
    render(<SignIn api={mockAPIClient} />);

    const emailInput = screen.getByLabelText('auth:signin.email');
    fireEvent.change(emailInput, { target: { value: 'anne@bretagne.duchy' } });

    const passwordInput = screen.getByLabelText('auth:signin.password');
    fireEvent.change(passwordInput, { target: { value: 'hermine' } });

    const submitButton = screen.getByText('auth:signin.signin');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({ email: 'anne@bretagne.duchy', password: 'hermine' })
    );

    expect(screen.queryByText('common:api_errors.ERROR_CODE')).not.toBeNull();
  });

  it('should show unknwon error code when API returns a non-400 error code', async () => {
    mockLogin.mockRejectedValue({ isAxiosError: true, response: { status: 502 } });
    render(<SignIn api={mockAPIClient} />);

    const emailInput = screen.getByLabelText('auth:signin.email');
    fireEvent.change(emailInput, { target: { value: 'anne@bretagne.duchy' } });

    const passwordInput = screen.getByLabelText('auth:signin.password');
    fireEvent.change(passwordInput, { target: { value: 'hermine' } });

    const submitButton = screen.getByText('auth:signin.signin');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({ email: 'anne@bretagne.duchy', password: 'hermine' })
    );

    expect(screen.queryByText('common:api_errors.UNKNOWN_ERROR')).not.toBeNull();
  });
});
