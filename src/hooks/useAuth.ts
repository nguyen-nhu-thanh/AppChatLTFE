// src/hooks/useAuth.ts

import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { AuthState } from '../types/chat';

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  reLoginCode: null,
  error: null,
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const { send, on, off } = useWebSocket();

  const register = useCallback(
    (username: string, password: string) => {
      send({
        action: 'onchat',
        data: {
          event: 'REGISTER',
          data: {
            user: username,
            pass: password,
          },
        },
      });
    },
    [send]
  );

  const login = useCallback(
    (username: string, password: string) => {
      const handleLoginResponse = (message: any) => {
        if (message.data?.event === 'RE_LOGIN') {
          const reLoginCode = message.data?.data?.RE_LOGIN_CODE;
          setAuth({
            isAuthenticated: true,
            username,
            reLoginCode,
            error: null,
          });
          off('RE_LOGIN', handleLoginResponse);
        } else if (message.data?.status === 'error') {
          setAuth((prev) => ({
            ...prev,
            error: message.data?.error || 'Login failed',
          }));
          off('RE_LOGIN', handleLoginResponse);
        }
      };

      on('RE_LOGIN', handleLoginResponse);

      send({
        action: 'onchat',
        data: {
          event: 'LOGIN',
          data: {
            user: username,
            pass: password,
          },
        },
      });
    },
    [send, on, off]
  );

  const reLogin = useCallback(
    (username: string, code: string) => {
      const handleReLoginResponse = (message: any) => {
        if (message.data?.status === 'success') {
          setAuth({
            isAuthenticated: true,
            username,
            reLoginCode: code,
            error: null,
          });
        } else {
          setAuth((prev) => ({
            ...prev,
            error: 'Re-login failed',
          }));
        }
        off('RE_LOGIN', handleReLoginResponse);
      };

      on('RE_LOGIN', handleReLoginResponse);

      send({
        action: 'onchat',
        data: {
          event: 'RE_LOGIN',
          data: {
            user: username,
            code,
          },
        },
      });
    },
    [send, on, off]
  );

  const logout = useCallback(() => {
    send({
      action: 'onchat',
      data: {
        event: 'LOGOUT',
      },
    });
    setAuth(initialState);
  }, [send]);

  return { auth, register, login, reLogin, logout };
}
