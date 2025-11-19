import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Breadcrumb, message, theme } from 'antd';
import { 
  UserOutlined, 
  LaptopOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined,
  BookOutlined,
  BankOutlined,
  GoldOutlined,
  BuildOutlined,
  LogoutOutlined,
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  VerticalAlignTopOutlined,
  AlertOutlined
} from '@ant-design/icons';
import NotificationBell from './NotificationBell';
import examenLogo from './examen.png';
import Capture from './Capture.png';
import alex from './alex.png';
const { Header, Sider, Content, Footer } = AntLayout;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Fetch user info on mount
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (response.ok) {
        message.success('Déconnexion réussie');
        navigate('/auth');
      } else {
        message.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      message.error('Erreur lors de la déconnexion');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => message.info('Paramètres à venir'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Se déconnecter',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Tableau de Bord</Link>,
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link to="/users">Utilisateurs</Link>,
    },
    {
      key: '/reference/departements',
      icon: <LaptopOutlined />,
      label: <Link to="/reference/departements">Données de Référence</Link>
      /*label: 'Données de Référence',*/
      
     /*, children: [
        {
          key: '/reference',
          icon: <DashboardOutlined />,
          label: <Link to="/reference">Vue d'ensemble</Link>,
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
      ],*/
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendrier & Planning',
      children: [
        {
          key: '/calendar',
          icon: <DashboardOutlined />,
          label: <Link to="/calendar">Vue d'ensemble</Link>,
        },
        {
          key: '/calendar/classes',
          icon: <span></span>,
          label: <Link to="/calendar/classes">Calendriers par Classe</Link>,
        },
        {
          key: '/calendar/timeslots/auto',
          icon: <span></span>,
          label: <Link to="/calendar/timeslots/auto">Créneaux Auto</Link>,
        },
        {
          key: '/calendar/timeslots',
          icon: <span></span>,
          label: <Link to="/calendar/timeslots">Gérer Créneaux</Link>,
        },
        {
          key: '/calendar/create',
          icon: <span></span>,
          label: <Link to="/calendar/create">Créer Planning</Link>,
        },
        {
          key: '/calendar/schedules',
          icon: <span></span>,
          label: <Link to="/calendar/schedules">Tous les Plannings</Link>,
        },
        {
          key: '/calendar/events',
          icon: <span></span>,
          label: <Link to="/calendar/events">Vue Calendrier</Link>,
        },
        {
          key: '/calendar/class-schedule',
          icon: <span></span>,
          label: <Link to="/calendar/class-schedule">Planning par Classe</Link>,
        },
        {
          key: '/calendar/weekly-schedule',
          icon: <span></span>,
          label: <Link to="/calendar/weekly-schedule">Planning Hebdo</Link>,
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Mon Profil</Link>,
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: <Link to="/admin">Administration</Link>,
    },
    {
      key: '/upload-students',
      icon: <VerticalAlignTopOutlined />,
      label: <Link to="/upload-students">Téléverser Étudiants</Link>,
    },
    {
      key: 'events',
      icon: <AlertOutlined />,
      label: 'Événements',
      children: [
        {
          key: '/student/events',
          icon: <span></span>,
          label: <Link to="/student/events">Mes Événements</Link>,
        },
        {
          key: '/events',
          icon: <span></span>,
          label: <Link to="/events">Consulter Événements</Link>,
        },
        {
          key: '/admin/events',
          icon: <span></span>,
          label: <Link to="/admin/events">Gérer Événements</Link>,
        },
      ],
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      {
        title: <Link to="/"><HomeOutlined /> Accueil</Link>,
      }
    ];

    if (pathSegments.length > 0) {
      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Create readable labels for segments
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        switch (segment) {
          case 'reference':
            label = 'Données de Référence';
            break;
          case 'specialites':
            label = 'Spécialités';
            break;
          case 'departements':
            label = 'Départements';
            break;
          case 'niveaux':
            label = 'Niveaux';
            break;
          case 'classes':
            label = 'Classes';
            break;
          case 'salles':
            label = 'Salles';
            break;
          case 'matieres':
            label = 'Matières';
            break;
          case 'profile':
            label = 'Mon Profil';
            break;
          case 'admin':
            label = 'Administration';
            break;
          case 'calendar':
            label = 'Calendrier';
            break;
          case 'timeslots':
            label = 'Créneaux Horaires';
            break;
          case 'auto':
            label = 'Génération Auto';
            break;
          case 'schedules':
            label = 'Plannings';
            break;
          case 'create':
            label = 'Créer';
            break;
          case 'events':
            // Distinguish between calendar events and events management
            label = pathSegments.includes('calendar') ? 'Vue Calendrier' : 'Événements';
            break;
          case 'class-schedule':
            label = 'Planning par Classe';
            break;
          case 'weekly-schedule':
            label = 'Planning Hebdomadaire';
            break;
          case 'class':
            label = 'Classe';
            break;
        }
        
        // Handle dynamic class ID in URL
        if (!isNaN(segment)) {
          label = `Classe ${segment}`;
        }

        breadcrumbItems.push({
          title: index === pathSegments.length - 1 ? 
            label : 
            <Link to={currentPath}>{label}</Link>
        });
      });
    }

    return breadcrumbItems;
  };

  return (
    <AntLayout hasSider>
      <Sider 
        style={siderStyle}
        width={240} 
        className="app-sider" 
        breakpoint="lg" 
        collapsedWidth="80"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        
        <Menu 
          theme="dark"
          mode="inline" 
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['reference', 'calendar']}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>

      <AntLayout>
        <Header className="app-header" style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-left">
            <h2>Learnflow</h2>
          </div>

          <div className="header-right">
            <Link to="/notifications" title="View all notifications">
              <NotificationBell />
            </Link>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              overlayClassName="user-menu-dropdown"
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  className="header-avatar"
                  src={user?.image} 
                  icon={<UserOutlined />}
                  size="default"
                />
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: '500',
                  display: window.innerWidth > 768 ? 'block' : 'none'
                }}>
                  {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {location.pathname !== '/' && (
          <Breadcrumb 
            className="app-breadcrumb"
            items={getBreadcrumbItems()}
          />
        )}

        <Content className="app-content" style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div className="page-transition">
            {children}
          </div>
        </Content>

        <Footer className="app-footer" style={{ textAlign: 'center' }}>
          © {new Date().getFullYear()} Learnflow - Plateforme d'apprentissage moderne
        </Footer>
      </AntLayout>
    </AntLayout>
  );
}

export default AppLayout;
