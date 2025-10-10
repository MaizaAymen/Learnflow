import React from 'react';
import { Button, Space, message } from 'antd';
import ReferenceAPI from '../services/ReferenceAPI';

const TestReferenceAPI = () => {
  const testSpecialites = async () => {
    try {
      const result = await ReferenceAPI.getSpecialites();
      console.log('Specialites result:', result);
      if (result.success) {
        message.success(`Fetched ${result.data.length} specialites`);
      } else {
        message.error(`Error: ${result.error}`);
      }
    } catch (error) {
      message.error(`Network error: ${error.message}`);
    }
  };

  const testCreateSpecialite = async () => {
    try {
      const result = await ReferenceAPI.createSpecialite({
        nom: 'Test Specialite',
        description: 'This is a test specialite'
      });
      console.log('Create specialite result:', result);
      if (result.success) {
        message.success('Specialite created successfully');
      } else {
        message.error(`Error: ${result.error}`);
      }
    } catch (error) {
      message.error(`Network error: ${error.message}`);
    }
  };

  const testStatistics = async () => {
    try {
      const stats = await ReferenceAPI.getStatistics();
      console.log('Statistics:', stats);
      message.info(`Stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      message.error(`Error getting statistics: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Reference API</h2>
      <Space>
        <Button type="primary" onClick={testSpecialites}>
          Test Get Specialites
        </Button>
        <Button type="primary" onClick={testCreateSpecialite}>
          Test Create Specialite
        </Button>
        <Button type="primary" onClick={testStatistics}>
          Test Statistics
        </Button>
      </Space>
      <p style={{ marginTop: 20 }}>
        Open browser console to see API responses. 
        Make sure your backend is running on http://localhost:3001
      </p>
    </div>
  );
};

export default TestReferenceAPI;