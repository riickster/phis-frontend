import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Avatar, Typography, Layout, Dropdown } from 'antd';
import { TableOutlined, UserOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const selectedKey = location.pathname === '/inventario'
    ? 'inventory'
    : location.pathname === '/manage-users'
    ? 'manage-users'
    : 'n/a';

  const [current, setCurrent] = useState(selectedKey);

  const onMenuClick = (e) => {
    setCurrent(e.key);
    if (e.key === 'inventory') navigate('/inventario');
    if (e.key === 'manage-users') navigate('/manage-users');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="name" disabled>
        {user?.displayName || user?.email}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={4} style={{ color: 'white', margin: 0 }}>
        PHIS
      </Title>

      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[current]}
        onClick={onMenuClick}
        items={[
          {
            label: 'Inventario',
            key: 'inventory',
            icon: <TableOutlined />,
          },
          ...(user?.email === 'admin@admin.com'
            ? [
                {
                  label: 'Administrar Usuarios',
                  key: 'manage-users',
                  icon: <TeamOutlined />,
                },
              ]
            : []),
        ]}
        style={{ flexGrow: 1, marginLeft: 50 }}
      />

      <Dropdown overlay={profileMenu} placement="bottomRight" arrow>
        <Avatar
          style={{ cursor: 'pointer', backgroundColor: 'white' }}
          icon={<UserOutlined style={{ color: 'black' }} />}
        />
      </Dropdown>
    </Header>
  );
};

export default Navbar;
