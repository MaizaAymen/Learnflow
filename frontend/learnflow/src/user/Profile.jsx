import React, { useEffect } from 'react';
import { useState } from 'react';
import { Divider, Form, Input } from 'antd';

const Profile = () => {
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    fetch("http://localhost:4000/api/auth/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials:'include',
    }).then(res=>res.json())
    .then(data=>{
        console.log(data);
        setProfile(data.user);
    })
    .catch(error => {
        console.error('Error:', error);
    });

},[] )
    return (
        <div>
            <>
    <Form name="layout-multiple-horizontal" layout="horizontal">
      <Form.Item
        label="horizontal"
        name="horizontal"
        rules={[{ required: true }]}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input />
      </Form.Item>
      <Form.Item layout="vertical" label="vertical" name="vertical" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item layout="vertical" label="vertical2" name="vertical2" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
    <Divider />
    <Form name="layout-multiple-vertical" layout="vertical">
      <Form.Item label="vertical" name="vertical" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="vertical2" name="vertical2" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        layout="horizontal"
        label="horizontal"
        name="horizontal"
        rules={[{ required: true }]}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input />
      </Form.Item>
    </Form>
  </>
          {profile ? (
            <div>
              <h2>Profile</h2>
              <p>Name: {profile.nom} {profile.prenom}</p>
              <p>Email: {profile.email}</p>
              <p>Role: {profile.role}</p>
            </div>
          ) : (
            <p>No profile data available</p>
          )}
        </div>
    );
}
export default Profile
