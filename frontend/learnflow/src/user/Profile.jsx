import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Avatar,
  Card,
  Col,
  Row,
  Tag,
  Typography,
  Divider,
  Space,
  Button,
  Empty,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Upload
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch("http://localhost:4000/api/auth/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials:'include',
    }).then(res=>res.json())
    .then(data=>{
        console.log(data);
        setProfile(data.user);
        if (data.user) {
          form.setFieldsValue(data.user);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        message.error('Erreur lors du chargement du profil');
    });

},[] )

const handleCompleteProfile = (values) => {
  setLoading(true);
  fetch("http://localhost:4000/api/auth/completeprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ ...values, id: profile.id })
  })
  .then(res => res.json())
  .then(data => {
      console.log(data);
      if (data.message) {
        message.success('Profil mis à jour avec succès!');
        setIsEditing(false);
        // Refresh profile data
        window.location.reload();
      } else {
        message.error(data.error || 'Erreur lors de la mise à jour');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      message.error('Erreur lors de la mise à jour du profil');
  })
  .finally(() => {
    setLoading(false);
  });
};

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'red';
      case 'enseignant': return 'blue';
      case 'etudiant': return 'green';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!profile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: '#f5f5f5' 
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Empty 
            description="Aucune donnée de profil disponible"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)', 
      minHeight: '100vh' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Card */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row align="middle" justify="space-between" gutter={24}>
            <Col>
              <Row align="middle" gutter={24}>
                <Col>
                  <Avatar 
                    size={100} 
                    src={profile.image} 
                    icon={<UserOutlined />}
                    style={{ 
                      backgroundColor: '#1890ff',
                      border: '4px solid #fff',
                      boxShadow: '0 4px 16px rgba(24,144,255,0.3)'
                    }}
                  />
                </Col>
                <Col>
                  <Title level={1} style={{ margin: 0, color: '#1890ff', fontSize: '2.5rem' }}>
                    {profile.nom} {profile.prenom}
                  </Title>
                  <Space size="large" style={{ marginTop: '12px' }}>
                    <Tag color={getRoleColor(profile.role)} style={{ 
                      fontSize: '16px', 
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none'
                    }}>
                      {profile.role?.toUpperCase()}
                    </Tag>
                    {profile.specialite && (
                      <Tag color="orange" style={{ 
                        fontSize: '16px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none'
                      }}>
                        {profile.specialite}
                      </Tag>
                    )}
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large"
                icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  borderRadius: '12px',
                  height: '48px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
                }}
              >
                {isEditing ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>Informations Personnelles</span>
                </Space>
              }
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong><MailOutlined /> Email:</Text>
                  <br />
                  <Text copyable style={{ color: '#1890ff' }}>{profile.email}</Text>
                </div>
                
                {profile.phone && (
                  <div>
                    <Text strong><PhoneOutlined /> Téléphone:</Text>
                    <br />
                    <Text>{profile.phone}</Text>
                  </div>
                )}
                
                {profile.cin && (
                  <div>
                    <Text strong>CIN:</Text>
                    <br />
                    <Text>{profile.cin}</Text>
                  </div>
                )}
                
                {profile.date_naissance && (
                  <div>
                    <Text strong><CalendarOutlined /> Date de naissance:</Text>
                    <br />
                    <Text>{formatDate(profile.date_naissance)}</Text>
                  </div>
                )}
                
                {profile.bio && (
                  <div>
                    <Text strong>Bio:</Text>
                    <br />
                    <Paragraph style={{ margin: 0 }}>{profile.bio}</Paragraph>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Location & Academic Info */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span>Localisation & Académique</span>
                </Space>
              }
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {profile.ville && (
                  <div>
                    <Text strong>Ville:</Text>
                    <br />
                    <Text>{profile.ville}</Text>
                  </div>
                )}
                
                {profile.pays && (
                  <div>
                    <Text strong>Pays:</Text>
                    <br />
                    <Text>{profile.pays}</Text>
                  </div>
                )}
                
                {profile.adresse && (
                  <div>
                    <Text strong>Adresse:</Text>
                    <br />
                    <Text>{profile.adresse}</Text>
                  </div>
                )}
                
                {profile.niveau_etude && (
                  <div>
                    <Text strong><BookOutlined /> Niveau d'étude:</Text>
                    <br />
                    <Text>{profile.niveau_etude}</Text>
                  </div>
                )}
                
                {profile.parcours && (
                  <div>
                    <Text strong>Parcours:</Text>
                    <br />
                    <Text>{profile.parcours}</Text>
                  </div>
                )}
                
                {profile.etablissement && (
                  <div>
                    <Text strong>Établissement:</Text>
                    <br />
                    <Text>{profile.etablissement}</Text>
                  </div>
                )}
                
                {profile.departement && (
                  <div>
                    <Text strong>Département:</Text>
                    <br />
                    <Text>{profile.departement}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Professional Info (for teachers) */}
          {profile.role === 'enseignant' && (
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#722ed1' }} />
                    <span>Informations Professionnelles</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Row gutter={[24, 16]}>
                  {profile.classes && profile.classes.length > 0 && (
                    <Col xs={24} md={12}>
                      <Text strong>Classes enseignées:</Text>
                      <br />
                      <Space wrap style={{ marginTop: '8px' }}>
                        {profile.classes.map((classe, index) => (
                          <Tag key={index} color="blue">{classe}</Tag>
                        ))}
                      </Space>
                    </Col>
                  )}
                  
                  {profile.certification && (
                    <Col xs={24} md={12}>
                      <Text strong>Certification:</Text>
                      <br />
                      <Text>{profile.certification}</Text>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          )}

          {/* Interests & Skills (for students) */}
          {profile.role === 'etudiant' && (profile.interets || profile.competences) && (
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#eb2f96' }} />
                    <span>Intérêts & Compétences</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Row gutter={[24, 16]}>
                  {profile.interets && profile.interets.length > 0 && (
                    <Col xs={24} md={12}>
                      <Text strong>Intérêts:</Text>
                      <br />
                      <Space wrap style={{ marginTop: '8px' }}>
                        {profile.interets.map((interet, index) => (
                          <Tag key={index} color="green">{interet}</Tag>
                        ))}
                      </Space>
                    </Col>
                  )}
                  
                  {profile.competences && profile.competences.length > 0 && (
                    <Col xs={24} md={12}>
                      <Text strong>Compétences:</Text>
                      <br />
                      <Space wrap style={{ marginTop: '8px' }}>
                        {profile.competences.map((competence, index) => (
                          <Tag key={index} color="orange">{competence}</Tag>
                        ))}
                      </Space>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          )}
        </Row>
        
        {/* Edit Profile Modal */}
        <Modal
          title={<span style={{ fontSize: '20px', color: '#1890ff' }}><EditOutlined /> Modifier le profil</span>}
          open={isEditing}
          onCancel={() => setIsEditing(false)}
          footer={null}
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCompleteProfile}
            style={{ marginTop: '20px' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nom"
                  name="nom"
                  rules={[{ required: true, message: 'Le nom est requis' }]}
                >
                  <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Prénom"
                  name="prenom"
                  rules={[{ required: true, message: 'Le prénom est requis' }]}
                >
                  <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Téléphone"
                  name="phone"
                >
                  <Input placeholder="+216 XX XXX XXX" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="CIN"
                  name="cin"
                >
                  <Input placeholder="12345678" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Date de naissance"
                  name="date_naissance"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label="Bio"
              name="bio"
            >
              <TextArea rows={3} placeholder="Parlez-nous de vous..." />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ville"
                  name="ville"
                >
                  <Input placeholder="Tunis" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Pays"
                  name="pays"
                >
                  <Input placeholder="Tunisie" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label="Adresse"
              name="adresse"
            >
              <Input placeholder="Adresse complète" />
            </Form.Item>
            
            {profile.role === 'etudiant' && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Niveau d'étude"
                      name="niveau_etude"
                    >
                      <Select placeholder="Sélectionner le niveau">
                        <Option value="licence">Licence</Option>
                        <Option value="master">Master</Option>
                        <Option value="doctorat">Doctorat</Option>
                        <Option value="ingenieur">Ingénieur</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Parcours"
                      name="parcours"
                    >
                      <Input placeholder="Votre parcours académique" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            
            {profile.role === 'enseignant' && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Département"
                      name="departement"
                    >
                      <Input placeholder="Département d'enseignement" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Établissement"
                      name="etablissement"
                    >
                      <Input placeholder="Nom de l'établissement" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  label="Certification"
                  name="certification"
                >
                  <Input placeholder="Vos certifications" />
                </Form.Item>
              </>
            )}
            
            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Enregistrer
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Annuler
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default Profile
