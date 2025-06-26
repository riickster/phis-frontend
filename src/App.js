import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Inventario from './pages/Inventario';
import ProductManage from './pages/ProductManage';
import { Layout, Menu, Avatar, Typography } from 'antd';
import {
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname === '/inventario' ? 'inventario' : 'n/a';

  const [current, setCurrent] = useState(selectedKey);

  const onMenuClick = e => {
    setCurrent(e.key);
    if (e.key === 'inventario') navigate('/inventario');
  };

  return (
    <Layout style={{ minHeight: '100vh', overflowX: "visible" }}>
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
              key: 'inventario',
              icon: <TableOutlined />,
            },
          ]}
          style={{ flexGrow: 1, marginLeft: 50 }}
        />

        <Avatar icon={<UserOutlined />} />
      </Header>

      <Content style={{padding: 24, background: '#fff' }}>
        <Routes>
          <Route path="/producto/:id" element={<ProductManage />} />
          <Route path="/inventario" element={<Inventario />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;
