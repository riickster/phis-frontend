import { Routes, Route, useLocation } from 'react-router-dom';
import Inventory from './pages/Inventory';
import ProductManage from './pages/ProductManage';
import Login from './pages/Login';
import ManageUsers from './pages/ManageUsers';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';

const { Content } = Layout;

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AuthProvider>
      <Layout style={{ minHeight: '100vh', overflowX: "visible" }}>
        {!isLoginPage && <Navbar />}
        <Content style={{ padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/inventario"
              element={
                <AuthGuard>
                  <Inventory />
                </AuthGuard>
              }
            />
            <Route
              path="/producto/:id"
              element={
                <AuthGuard>
                  <ProductManage />
                </AuthGuard>
              }
            />
            <Route
              path="/manage-users"
              element={
                <AuthGuard>
                  <ManageUsers />
                </AuthGuard>
              }
            />
          </Routes>
        </Content>
      </Layout>
    </AuthProvider>
  );
};

export default App;
