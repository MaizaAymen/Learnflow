import React, { useEffect } from 'react';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Avatar,
  Card,
  Col,
  Row,
  Tag,
  Typography,

const API_BASE = import.meta.env.VITE_AUTH_URL?.replace('/auth', '') || 'http://localhost:3000';
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
  Upload,
  Tabs
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
  UploadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import StudentAbsencesTab from './StudentAbsencesTab';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  useEffect(() => {
    setProfileLoading(true);
    fetch(`${API_BASE}/api/auth/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials:'include',
    }).then(res => {
        if (!res.ok) {
          throw new Error('Échec de la connexion au serveur');
        }
        return res.json();
    })
    .then(data => {
        if (data.user) {
          setProfile(data.user);
          message.success('Profil chargé avec succès');
        } else {
          message.warning('Aucune donnée de profil trouvée. Veuillez compléter vos informations.');
        }
    })
    .catch(error => {
        console.error('Erreur de chargement du profil:', error);
        message.error('Impossible de charger votre profil. Vérifiez votre connexion internet et réessayez.');
    })
    .finally(() => {
        setProfileLoading(false);
    });
  }, []);

  // Populate form when modal opens or profile changes
  useEffect(() => {
    if (isEditing && profile && form) {
      const formData = { ...profile };
      // Ensure image field is always an array
      if (!formData.image) {
        formData.image = [];
      } else if (!Array.isArray(formData.image)) {
        formData.image = [];
      }
      // Convert date string to dayjs object
      if (formData.date_naissance) {
        formData.date_naissance = dayjs(formData.date_naissance);
      }
      form.setFieldsValue(formData);
    }
  }, [isEditing, profile, form]);

const handleCompleteProfile = (values) => {
  setLoading(true);
  message.loading({ content: 'Mise à jour de votre profil en cours...', key: 'updating' });
  
  // Prepare request body
  const requestBody = { ...values, id: profile.id };
  
  // Convert dayjs date back to string
  if (requestBody.date_naissance && requestBody.date_naissance.format) {
    requestBody.date_naissance = requestBody.date_naissance.format('YYYY-MM-DD');
  }
  
  // Remove empty password fields if user doesn't want to change password
  if (!values.new_password) {
    delete requestBody.new_password;
    delete requestBody.confirm_password;
  }
  
  // Handle image upload separately if new image selected
  const imageFileList = values.image;
  const hasNewImage = Array.isArray(imageFileList) && imageFileList.length > 0 && imageFileList[0]?.originFileObj;
  
  const uploadPromise = hasNewImage 
    ? uploadProfileImage(imageFileList[0].originFileObj)
    : Promise.resolve(null);

  uploadPromise.then(imageUrl => {
    if (imageUrl) {
      requestBody.image = imageUrl;
    }
    // Remove image field from request body since it's handled separately
    delete requestBody.image;
    
    fetch(`${API_BASE}/api/auth/completeprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(requestBody)
    })
    .then(res => {
        if (!res.ok) {
          throw new Error('Erreur de connexion au serveur');
        }
        return res.json();
    })
    .then(data => {
        if (data.message || data.user) {
          setProfile({ ...profile, ...requestBody, image: imageUrl || profile.image });
          message.success({ 
            content: 'Votre profil a été mis à jour avec succès !', 
            key: 'updating',
            duration: 3 
          });
          setIsEditing(false);
          form.resetFields();
        } else {
          throw new Error(data.error || 'Réponse inattendue du serveur');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        message.error({ 
          content: `Impossible de mettre à jour votre profil: ${error.message}. Veuillez réessayer.`,
          key: 'updating',
          duration: 5
        });
    })
    .finally(() => {
      setLoading(false);
    });
  }).catch(error => {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    message.error('Erreur lors de l\'upload de la photo. Veuillez réessayer.');
    setLoading(false);
  });
};

const uploadProfileImage = (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', profile.id);

    fetch(`${API_BASE}/api/auth/upload-profile-photo`, {
      method: "POST",
      body: formData,
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.user && data.user.image) {
        resolve(data.user.image);
      } else {
        reject(new Error('Image upload failed'));
      }
    })
    .catch(reject);
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
    if (!dateString) return 'Non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (profileLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: '#f5f5f5' 
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <div style={{ padding: '40px' }}>
            <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>Chargement de votre profil...</Title>
            <Text type="secondary">Veuillez patienter pendant que nous récupérons vos informations.</Text>
          </div>
        </Card>
      </div>
    );
  }

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
            description={
              <div>
                <p>Aucune donnée de profil disponible</p>
                <Text type="secondary">
                  Il semble que votre profil ne soit pas encore configuré. 
                  Veuillez vous reconnecter ou contacter l'administrateur.
                </Text>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button 
            type="primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px' }}
          >
            Recharger la page
          </Button>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          Informations Personnelles
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
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
                  <Text copyable style={{ color: '#1890ff' }}>{profile.email || 'Non renseigné'}</Text>
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
      )
    }
  ];

  if (profile.role === 'etudiant') {
    tabItems.push({
      key: '2',
      label: (
        <span>
          <ExclamationCircleOutlined />
          Mes Absences & Éliminations
        </span>
      ),
      children: <StudentAbsencesTab studentId={profile.id} />
    });

    tabItems.push({
      key: '3',
      label: (
        <span>
          <BookOutlined />
          Mes Justifications
        </span>
      ),
      children: (
        <div style={{ marginTop: '20px' }}>
          <Card title="Justifications d'absence" loading={false}>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Gérez vos justifications d'absence en un seul endroit. Consultez l'état de vos justifications et soumettez de nouvelles justifications si nécessaire.
            </p>
            <Button 
              type="primary" 
              size="large"
              onClick={() => window.location.href = '/absences/justifications'}
              style={{ marginTop: '10px' }}
            >
              📋 Voir mes justifications
            </Button>
          </Card>
        </div>
      )
    });
  }

  return (
    <div className="page-wrapper animate-fadeInUp">
      <div className="app-container">
        <Card 
          className="data-card hover-lift"
          style={{ marginBottom: 'var(--space-6)' }}
          styles={{ body: { padding: 'var(--space-8)' } }}
        >
          <Row align="middle" justify="space-between" gutter={24}>
            <Col>
              <Row align="middle" gutter={24}>
                <Col>
                  <Avatar 
                    size={100} 
                    src={profile.image ? `http://localhost:4000${profile.image}` : null}
                    icon={<UserOutlined />}
                    className="status-online hover-glow"
                    style={{ 
                      backgroundColor: 'var(--primary-500)',
                      border: '4px solid var(--bg-primary)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                </Col>
                <Col>
                  <Title level={1} className="form-title" style={{ margin: 0, fontSize: 'var(--font-size-4xl)' }}>
                    {profile.nom} {profile.prenom}
                  </Title>
                  <Space size="large" style={{ marginTop: 'var(--space-3)' }}>
                    <div className={`status-badge status-badge--${getRoleColor(profile.role) === 'red' ? 'error' : getRoleColor(profile.role) === 'blue' ? 'info' : 'success'}`}>
                      {profile.role?.toUpperCase()}
                    </div>
                    {profile.specialite && (
                      <div className="status-badge status-badge--warning">
                        {profile.specialite}
                      </div>
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
                className="hover-lift"
                style={{
                  height: 'var(--space-12)',
                  paddingLeft: 'var(--space-6)',
                  paddingRight: 'var(--space-6)'
                }}
              >
                {isEditing ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </Col>
          </Row>
        </Card>

        <Tabs defaultActiveKey="1" items={tabItems} />
        
        <Modal
          title={
            <div>
              <span style={{ fontSize: '20px', color: '#1890ff' }}>
                <EditOutlined /> Modifier le profil
              </span>
              <br />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Complétez vos informations pour améliorer votre expérience sur la plateforme
              </Text>
            </div>
          }
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
            <Divider orientation="left">📸 Photo de Profil</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Photo Actuelle:</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Avatar 
                      size={80}
                      src={profile.image ? `http://localhost:4000${profile.image}` : null}
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: '#1890ff',
                        border: '2px solid #1890ff'
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Changer la Photo"
                  name="image"
                  rules={[]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList || [];
                  }}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    accept="image/*"
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />} block>
                      Cliquez pour changer votre photo
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">👤 Informations Personnelles</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nom"
                  name="nom"
                  rules={[{ required: true, message: 'Veuillez saisir votre nom de famille' }]}
                >
                  <Input 
                    disabled 
                    style={{ backgroundColor: '#f5f5f5' }} 
                    placeholder="Cette information ne peut pas être modifiée"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Prénom"
                  name="prenom"
                  rules={[{ required: true, message: 'Veuillez saisir votre prénom' }]}
                >
                  <Input 
                    disabled 
                    style={{ backgroundColor: '#f5f5f5' }} 
                    placeholder="Cette information ne peut pas être modifiée"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input 
                    disabled 
                    style={{ backgroundColor: '#f5f5f5' }} 
                    placeholder="Votre adresse email ne peut pas être modifiée"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Téléphone"
                  name="phone"
                  rules={[
                    { 
                      pattern: /^[\+]?[(]?[0-9\s\-\(\)]{8,}$/, 
                      message: 'Veuillez saisir un numéro de téléphone valide' 
                    }
                  ]}
                >
                  <Input placeholder="Exemple: +216 XX XXX XXX" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="CIN"
                  name="cin"
                  rules={[
                    { 
                      pattern: /^[0-9]{8}$/, 
                      message: 'Le CIN doit contenir exactement 8 chiffres' 
                    }
                  ]}
                >
                  <Input placeholder="Saisissez votre numéro CIN (8 chiffres)" maxLength={8} />
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
              rules={[
                { max: 500, message: 'La biographie ne doit pas dépasser 500 caractères' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Parlez-nous de vous, vos passions, vos objectifs... (maximum 500 caractères)"
                showCount
                maxLength={500}
              />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ville"
                  name="ville"
                >
                  <Input placeholder="Exemple: Tunis, Sousse, Sfax..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Pays"
                  name="pays"
                >
                  <Input placeholder="Exemple: Tunisie, France, Canada..." />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label="Adresse"
              name="adresse"
            >
              <Input placeholder="Votre adresse complète (rue, numéro, code postal...)" />
            </Form.Item>
            
            {profile.role === 'etudiant' && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Niveau d'étude"
                      name="niveau_etude"
                    >
                      <Select placeholder="Choisissez votre niveau d'étude actuel">
                        <Option value="licence">Licence (L1, L2, L3)</Option>
                        <Option value="master">Master (M1, M2)</Option>
                        <Option value="doctorat">Doctorat / PhD</Option>
                        <Option value="ingenieur">École d'Ingénieur</Option>
                        <Option value="autre">Autre</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Parcours"
                      name="parcours"
                    >
                      <Input placeholder="Exemple: Informatique, Mathématiques, Économie..." />
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
                      <Input placeholder="Exemple: Informatique, Mathématiques, Langues..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Établissement"
                      name="etablissement"
                    >
                      <Input placeholder="Exemple: Université de Tunis, ESPRIT, INSAT..." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  label="Certification"
                  name="certification"
                >
                  <Input placeholder="Exemple: AWS Certified, Microsoft Certified, Cisco..." />
                </Form.Item>
              </>
            )}
            
            <Divider orientation="left">🔐 Sécurité & Mot de Passe</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nouveau Mot de Passe"
                  name="new_password"
                  rules={[
                    {
                      min: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Le mot de passe doit contenir majuscules, minuscules et chiffres'
                    }
                  ]}
                >
                  <Input.Password 
                    placeholder="Laissez vide pour ne pas changer"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirmer le Mot de Passe"
                  name="confirm_password"
                  dependencies={['new_password']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value && !getFieldValue('new_password')) {
                          return Promise.resolve();
                        }
                        if (value === getFieldValue('new_password')) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </Form.Item>
              </Col>
            </Row>
            
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
                  {loading ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                  disabled={loading}
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
