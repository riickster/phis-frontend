import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Typography,
  message,
  Row,
  Col,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);

  const [formCreate] = Form.useForm();
  const [formName] = Form.useForm();
  const [formPassword] = Form.useForm();

  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate()

  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      message.error('Error al cargar usuarios');
    }
    setLoading(false);
  };

  useEffect(() => {
    if(user?.email != "admin@admin.com") {
      navigate("/inventario")
    }
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('Usuario eliminado');
      fetchUsers();
    } catch (error) {
      message.error('Error al eliminar usuario');
    }
  };

  const openCreateModal = () => {
    formCreate.resetFields();
    setModalVisible(true);
  };
  const handleCreate = async (values) => {
    try {
      await api.post('/users', values);
      message.success('Usuario creado');
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Error al crear usuario');
    }
  };

  const openEditNameModal = (user) => {
    setSelectedUser(user);
    formName.setFieldsValue({ displayName: user.displayName });
    setEditNameVisible(true);
  };
  const handleNameUpdate = async (values) => {
    try {
      await api.put(`/users/${selectedUser.id}/displayName`, {
        displayName: values.displayName,
      });
      message.success('Nombre actualizado');
      setEditNameVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Error al actualizar el nombre');
    }
  };

  const openEditPasswordModal = (user) => {
    setSelectedUser(user);
    formPassword.resetFields();
    setEditPasswordVisible(true);
  };
  const handlePasswordUpdate = async (values) => {
    try {
      await api.put(`/users/${selectedUser.id}/password`, {
        password: values.password,
      });
      message.success('Contraseña actualizada');
      setEditPasswordVisible(false);
    } catch (error) {
      message.error('Error al actualizar la contraseña');
    }
  };

  const columns = [
    {
      title: 'Correo',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre de Usuario',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="¿Seguro que quieres eliminar este usuario?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger size="small">Eliminar</Button>
          </Popconfirm>

          <Button size="small" onClick={() => openEditNameModal(record)}>
            Cambiar Nombre
          </Button>

          <Button size="small" onClick={() => openEditPasswordModal(record)}>
            Cambiar Contraseña
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '0 24px 24px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Gestión de Usuarios
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={openCreateModal}
            icon={<PlusOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Crear Usuario
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ flexGrow: 1 }}
        bordered
      />

      {/* Modal Crear Usuario */}
      <Modal
        title="Crear Nuevo Usuario"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => formCreate.submit()}
        okText="Crear"
      >
        <Form form={formCreate} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: 'Por favor ingresa el correo.' },
              { type: 'email', message: 'Ingresa un correo válido.' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="Nombre de Usuario"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de usuario.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Por favor ingresa la contraseña.' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cambiar Nombre */}
      <Modal
        title="Cambiar Nombre de Usuario"
        visible={editNameVisible}
        onCancel={() => setEditNameVisible(false)}
        onOk={() => formName.submit()}
        okText="Actualizar"
      >
        <Form form={formName} layout="vertical" onFinish={handleNameUpdate}>
          <Form.Item
            name="displayName"
            label="Nuevo Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nuevo nombre.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cambiar Contraseña */}
      <Modal
        title="Cambiar Contraseña"
        visible={editPasswordVisible}
        onCancel={() => setEditPasswordVisible(false)}
        onOk={() => formPassword.submit()}
        okText="Actualizar"
      >
        <Form form={formPassword} layout="vertical" onFinish={handlePasswordUpdate}>
          <Form.Item
            name="password"
            label="Nueva Contraseña"
            rules={[{ required: true, message: 'Por favor ingresa la nueva contraseña.' }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Por favor confirma la contraseña.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden.'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
