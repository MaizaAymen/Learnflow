import React, { useEffect, useState } from "react";
import { Space, Table, Tag, Button } from "antd";
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import {
  DesktopOutlined,
  FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  TeamOutlined,
 
} from '@ant-design/icons';
import { Layout} from 'antd';
const { Header, Content, Footer, Sider } = Layout;


import {  Menu, theme } from 'antd';

const items1 = ['1', '2', '3'].map(key => ({
  key,
  label: `nav ${key}`,
}));
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: Array.from({ length: 4 }).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});


const CreationClasse = () => {
  //  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // nom, description, effectif, niveau_id
  const [nom,setNom] = useState("");
  const[typecapacite,settypecapacite]=useState("");
  const [localisation,setLocalisation] = useState("");
  const [description,setDescription] = useState("");


  //
  const [departments, setDepartments] = useState([]);
//
//sidbar
 const [collapsed, setCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  // define table columns
  const columns = [
    //
    {
      title: "name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut) => {
        let color = statut === "inactif" ? "actif" : "green";
        return <Tag color={color}>{statut.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Edit {record.nom}</a>
          <button style={{ color: "red" }} onClick={() => departementdelete(record.id)}>Edit</button>
          <button style={{ color: "red" }} onClick={() => departementdelete(record.id)}>Delete</button>
        </Space>
      ),
    },
  ];
//crud deparement


  const handleLogout = () => {
    fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include", // include cookies
        headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // Handle logout success
      });
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/reference/departements", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setDepartments(Array.isArray(data) ? data : data.departments);
      });
  }, []);

const handelcreateclass=()=>{
     fetch("http://localhost:3000/api/reference/classes",{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom:nom,
          description:description,
          typecapacite:typecapacite,
          localisation:localisation,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        
        });
  };



  return (
    <div>
  <Layout>
      <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      <div className="demo-logo" style={{ color: '#fff', fontWeight: 'bold' }}>
        MyApp
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['1']}
        items={items1}
        style={{ flex: 1, minWidth: 0 }}
      />

      <Button
        type="primary"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
      >
        Logout
      </Button>
    </Header>
      <div style={{ padding: '0 48px' }}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
        />
        <Layout
          style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%' }}
              items={items2}
            />
          </Sider>
          {/* <Table
        columns={columns}
        dataSource={departments}
        rowKey="id" // important: use "id" as unique key
        style={{ marginTop: 20 }}
        
      /> */}
       <button onClick={handelcreateclass}>Create Class</button>
    <input type="text" placeholder="nom" value={nom} onChange={(e)=>setNom(e.target.value)}/>
    <input type="text" placeholder="description" value={description} onChange={(e)=>setDescription(e.target.value)}/>
    <input type="text" placeholder="typecapacite" value={typecapacite} onChange={(e)=>settypecapacite(e.target.value)}/>
    <input type="text" placeholder="localisation" value={localisation} onChange={(e)=>setLocalisation(e.target.value)}/>
          <Content style={{ padding: '0 24px', minHeight: 280 }}>Content</Content>
        </Layout>
      </div>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>

</div>
  );
};

export default CreationClasse;
