import React from 'react';
import { Card, Button } from 'antd';

const SimpleReference = () => {
  return (
    <div style={{ padding: 20 }}>
      <Card title="Reference Management Test">
        <h2>Simple Reference Component</h2>
        <p>If you can see this, the routing is working!</p>
        <Button type="primary">Test Button</Button>
      </Card>
    </div>
  );
};

export default SimpleReference;