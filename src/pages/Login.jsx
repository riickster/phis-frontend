import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/inventario');
    } catch (err) {
      console.error('Login error:', err);
      const code = err.code;

      if (code === 'auth/invalid-credential') {
        setError('Usuario y/o contraseña incorrecto(s).');
      } else {
        setError('Error inesperado. Intente de nuevo.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        background: '#ffffff',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 8,
          border: 'none',
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Bienvenido de Vuelta a PHIS
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError('')}
          />
        )}

        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu correo electrónico.' },
              { type: 'email', message: 'Ingresa un correo válido.' },
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña.' },
            ]}
          >
            <Input.Password placeholder="********" disabled={loading} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block
              style={{ height: '40px', fontWeight: 'bold' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
