import React from 'react';
import { Layout, Menu } from 'antd';
import { AppstoreOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ height: 32, margin: 16, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Safe Beauty Admin</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['products']}>
          <Menu.Item key="products" icon={<AppstoreOutlined />}>
            <Link to="/dashboard/products">Produits</Link>
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
            Se déconnecter
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
