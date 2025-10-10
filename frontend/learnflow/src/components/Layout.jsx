import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  LaptopOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined,
  BookOutlined,
  BankOutlined,
  GoldOutlined,
  BuildOutlined
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = AntLayout;

const AppLayout = ({ children }) => {
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/">Utilisateurs</Link>,
    },
    {
      key: 'reference',
      icon: <LaptopOutlined />,
      label: 'Données de Référence',
      children: [
        {
          key: '/reference',
          label: <Link to="/reference">Tableau de Bord</Link>,
        },
        {
          key: '/reference/specialites',
          icon: <GoldOutlined />,
          label: <Link to="/reference/specialites">Spécialités</Link>,
        },
        {
          key: '/reference/departements',
          icon: <BankOutlined />,
          label: <Link to="/reference/departements">Départements</Link>,
        },
        {
          key: '/reference/niveaux',
          icon: <TeamOutlined />,
          label: <Link to="/reference/niveaux">Niveaux</Link>,
        },
        {
          key: '/reference/classes',
          icon: <HomeOutlined />,
          label: <Link to="/reference/classes">Classes</Link>,
        },
        {
          key: '/reference/salles',
          icon: <BuildOutlined />,
          label: <Link to="/reference/salles">Salles</Link>,
        },
        {
          key: '/reference/matieres',
          icon: <BookOutlined />,
          label: <Link to="/reference/matieres">Matières</Link>,
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profil</Link>,
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: <Link to="/admin">Administration</Link>,
    },
  ];

  return (
    <AntLayout className="app-layout">
      <Sider width={220} className="app-sider" breakpoint="lg" collapsedWidth="0">
        <div className="logo">Learnflow</div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={[window.location.pathname]}
          defaultOpenKeys={['reference']}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header className="app-header">
          <div className="header-left">
            <h2>Learnflow</h2>
          </div>
          <div className="header-right">
            <Avatar icon={<UserOutlined />} />
          </div>
        </Header>
        <Content className="app-content">
          {children}
        </Content>
        <Footer className="app-footer">© {new Date().getFullYear()} Learnflow</Footer>
      </AntLayout>
    </AntLayout>
  );
}

export default AppLayout;
