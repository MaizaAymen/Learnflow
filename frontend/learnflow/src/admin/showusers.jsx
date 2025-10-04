import React, { useEffect, useState } from "react";
import { Space, Table, Tag, Button } from "antd";
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout} from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  TeamOutlined,
 
} from '@ant-design/icons';
import {  Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;
const items = [
  {
    key: '1',
    icon: <PieChartOutlined />,
    label: 'Option 1',
  },
  {
    key: '2',
    icon: <DesktopOutlined />,
    label: 'Option 2',
  },
  {
    key: 'sub1',
    icon: <UserOutlined />,
    label: 'User',
    children: [
      {
        key: '3',
        label: 'Tom',
      },
      {
        key: '4',
        label: 'Bill',
      },
      {
        key: '5',
        label: 'Alex',
      },
    ],
  },
  {
    key: 'sub2',
    icon: <TeamOutlined />,
    label: 'Team',
    children: [
      {
        key: '6',
        label: 'Team 1',
      },
      {
        key: '7',
        label: 'Team 2',
      },
    ],
  },
  {
    key: '9',
    icon: <FileOutlined />,
  },
];
const ShowUsers = () => {
  const [users, setUsers] = useState([]);

//sidbar
 const [collapsed, setCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  // define table columns
  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Prénom",
      dataIndex: "prenom",
      key: "prenom",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = role === "admin" ? "geekblue" : "green";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Edit {record.nom}</a>
          <a style={{ color: "red" }}>Delete</a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetch("http://localhost:4000/api/auth/getAllUsers", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUsers(Array.isArray(data) ? data : data.users);
      });
  }, []);

  return (
    <div>
      {/* <h2>Users List</h2>
      <Button type="primary" onClick={handleFetchingUsers}>
        Show Users
        
      </Button> 
          <h2>Users List</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id" // important: use "id" as unique key
        style={{ marginTop: 20 }}
      />
      */}
       <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['3']}
          defaultOpenKeys={['sub1']}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
            <Button type="primary" onClick={handleFetchingUsers}>
        Show Users
        
      </Button> 
          <h2>Users List</h2>
           <Table
        columns={columns}
        dataSource={users}
        rowKey="id" // important: use "id" as unique key
        style={{ marginTop: 20 }}
        
      />
        </Content>
      </Layout>
    </Layout>
    </div>
  );
};

export default ShowUsers;
