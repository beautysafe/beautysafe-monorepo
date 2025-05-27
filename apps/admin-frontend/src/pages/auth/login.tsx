import React from 'react';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api/api-client';

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Define the mutation for login
  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      // Change URL if you need, but this will use your api's baseURL
      return api.post<{ access_token: string }, { email: string; password: string }>(
        '/auth/login',
        values
      );
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      message.success('Connexion réussie');
      navigate('/dashboard/products');
    },
    onError: () => {
      message.error('Email ou mot de passe incorrect');
    }
  });

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 32, border: '1px solid #eee', borderRadius: 10 }}>
      <h2 style={{ textAlign: 'center' }}>Admin Login</h2>
      <Form
        layout="vertical"
        onFinish={(values) => loginMutation.mutate(values)}
        autoComplete="off"
      >
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item name="password" label="Mot de passe" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Connexion
        </Button>
      </Form>
    </div>
  );
};

export default Login;
