import React from "react";
import { Layout, Menu, Avatar, Card, Dropdown } from "antd";
import {
  AppstoreOutlined,
  ExperimentOutlined,
  QuestionCircleOutlined,
  TagsOutlined,
  NotificationOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "categories",
    icon: <AppstoreOutlined />,
    label: <Link to="/dashboard/categories">Catégories</Link>,
  },
  {
    key: "ingredients",
    icon: <ExperimentOutlined />,
    label: <Link to="/dashboard/ingredients">Ingrédients</Link>,
  },
  {
    key: "quiz",
    icon: <QuestionCircleOutlined />,
    label: <Link to="/dashboard/coming-soon">Quiz</Link>,
  },
  {
    key: "brands",
    icon: <TagsOutlined />,
    label: <Link to="/dashboard/brands">Marques</Link>,
  },
  {
    key: "announcements",
    icon: <NotificationOutlined />,
    label: <Link to="/dashboard/coming-soon">Annonces</Link>,
  },
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Dropdown menu for user
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Se déconnecter
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: "linear-gradient(135deg, #b80054 0%, #4d0022 100%)",
          boxShadow: "2px 0 8px #f0f1f2",
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Avatar
            size={collapsed ? 40 : 48}
            src={logo}
            style={{ background: "#fff", marginRight: collapsed ? 0 : 12 }}
            icon={<AppstoreOutlined />}
          />
          {!collapsed && (
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 1,
              }}
            >
              Safe Beauty
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["categories"]}
          style={{
            background: "transparent",
            borderRadius: 12,
            margin: "8px 8px 32px 8px",
            fontSize: 16,
          }}
          items={[
            ...menuItems,
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: <span onClick={logout}>Se déconnecter</span>,
              style: { marginTop: "40px", color: "#ffccc7" },
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: 22, marginRight: 18, cursor: "pointer" },
              }
            )}
            <h2 style={{ margin: 0, fontWeight: 600, color: "#3e416d" }}>
              Dashboard
            </h2>
          </div>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <Avatar size={36} style={{ background: "#7c92ec" }} icon={<UserOutlined />} />
              <span style={{ marginLeft: 10, fontWeight: 500, color: "#3e416d" }}>
                Admin
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            minHeight: 280,
            background: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 1200,
              margin: "auto",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(44,77,147,0.10)",
              background: "#fff",
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Outlet />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
