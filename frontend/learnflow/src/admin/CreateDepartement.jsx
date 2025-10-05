import React, { useState } from "react";
import { 
  Button, 
  Form, 
  Input, 
  Layout, 
  Menu, 
  Breadcrumb, 
  Row, 
  Col, 
  InputNumber,
  Select,
  message,
  theme,
  Space
} from "antd";
import { LaptopOutlined, NotificationOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;

const items1 = [
  { key: '1', label: 'Dashboard' },
  { key: '2', label: 'Users' },
  { key: '3', label: 'Reports' }
];

const items2 = [
  {
    key: 'users',
    icon: React.createElement(UserOutlined),
    label: 'User Management',
    children: [
      { key: 'show-users', label: 'Show Users' },
      { key: 'add-user', label: 'Add User' },
      { key: 'user-roles', label: 'User Roles' },
      { key: 'user-permissions', label: 'Permissions' },
    ],
  },
  {
    key: 'departments',
    icon: React.createElement(LaptopOutlined),
    label: 'Departments',
    children: [
      { key: 'show-departments', label: 'Show Departments' },
      { key: 'create-department', label: 'Create Department' },
      { key: 'department-budget', label: 'Budget Management' },
      { key: 'department-staff', label: 'Staff Assignment' },
    ],
  },
  {
    key: 'settings',
    icon: React.createElement(NotificationOutlined),
    label: 'System Settings',
    children: [
      { key: 'general-settings', label: 'General Settings' },
      { key: 'notifications', label: 'Notifications' },
      { key: 'backup', label: 'Backup & Restore' },
      { key: 'logs', label: 'System Logs' },
    ],
  },
];

const CreateDepartment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // Handle logout success
      });
  };

  const handleCreateDepartment = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/adddepartements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success("Department created successfully");
        form.resetFields();
      } else {
        message.error(data.message || "Failed to create department");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while creating the department");
    } finally {
      setLoading(false);
    }
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
            
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
              <h2>Add Department</h2>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateDepartment}
                style={{ marginTop: 20, maxWidth: 800 }}
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Department Name"
                      name="name"
                      rules={[
                        { required: true, message: 'Please enter department name!' },
                        { min: 2, message: 'Name must be at least 2 characters!' }
                      ]}
                    >
                      <Input placeholder="Enter department name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Department Code"
                      name="code"
                      rules={[
                        { required: true, message: 'Please enter department code!' },
                        { pattern: /^[A-Z0-9]{2,10}$/, message: 'Code must be 2-10 uppercase letters/numbers!' }
                      ]}
                    >
                      <Input 
                        placeholder="e.g., CS, MATH, ENG"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[
                        { required: true, message: 'Please enter department description!' },
                        { min: 10, message: 'Description must be at least 10 characters!' }
                      ]}
                    >
                      <Input.TextArea 
                        placeholder="Enter department description"
                        rows={3}
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Chef Department ID"
                      name="chef_departement_id"
                      rules={[{ required: true, message: 'Please enter chef department ID!' }]}
                    >
                      <InputNumber 
                        placeholder="Enter chef ID" 
                        style={{ width: '100%' }}
                        min={1}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Budget"
                      name="budget"
                      rules={[{ required: true, message: 'Please enter budget!' }]}
                    >
                      <InputNumber 
                        placeholder="Enter budget amount" 
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Status"
                      name="statut"
                      rules={[{ required: true, message: 'Please select status!' }]}
                    >
                      <Select placeholder="Select status">
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                        <Option value="pending">Pending</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Location"
                      name="localisation"
                      rules={[{ required: true, message: 'Please enter location!' }]}
                    >
                      <Input placeholder="Enter department location" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Phone Number"
                      name="telephone"
                      rules={[
                        { required: true, message: 'Please enter phone number!' },
                        { pattern: /^[\+]?[0-9\s\-\(\)]{8,15}$/, message: 'Please enter a valid phone number!' }
                      ]}
                    >
                      <Input placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                      ]}
                    >
                      <Input placeholder="Enter department email" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Maximum Capacity"
                      name="capacite_max"
                      rules={[{ required: true, message: 'Please enter maximum capacity!' }]}
                    >
                      <InputNumber 
                        placeholder="Enter max capacity" 
                        style={{ width: '100%' }}
                        min={1}
                        max={10000}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: 20 }}>
                  <Space size="middle">
                    <Button onClick={() => form.resetFields()}>
                      Reset
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading}
                    >
                      Add Department
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Content>
          </Layout>
        </div>
        
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </div>
  );
};

export default CreateDepartment;
