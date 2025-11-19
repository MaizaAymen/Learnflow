import React from 'react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
const { Option } = Select;
const villes = [
  {
    value: "tunis",
    label: "Tunis",
    children: [
      {
        value: "la_marsa",
        label: "La Marsa",
        children: [{ value: "safsaf", label: "Safsaf" }, { value: "gammarth", label: "Gammarth" }],
      },
      {
        value: "le_kram",
        label: "Le Kram",
        children: [{ value: "kram_est", label: "Kram Est" }, { value: "kram_ouest", label: "Kram Ouest" }],
      },
      {
        value: "el_ouardia",
        label: "El Ouardia",
        children: [{ value: "citè_ennasr", label: "Cité Ennasr" }, { value: "mornag", label: "Mornag" }],
      },
    ],
  },
  {
    value: "ariana",
    label: "Ariana",
    children: [
      {
        value: "raoued",
        label: "Raoued",
        children: [{ value: "chotrana", label: "Chotrana" }, { value: "ennkhilet", label: "Ennkhilet" }],
      },
      {
        value: "soukra",
        label: "La Soukra",
        children: [{ value: "chotrana_2", label: "Chotrana 2" }, { value: "ennasr", label: "Ennasr" }],
      },
    ],
  },
  {
    value: "ben_arous",
    label: "Ben Arous",
    children: [
      {
        value: "rades",
        label: "Radès",
        children: [{ value: "rue_de_marseille", label: "Rue de Marseille" }, { value: "radès_meliane", label: "Radès Méliane" }],
      },
      {
        value: "mhamdia",
        label: "M'Hamdia",
        children: [{ value: "centre", label: "Centre" }, { value: "borj_el_amri", label: "Borj El Amri" }],
      },
    ],
  },
  {
    value: "manouba",
    label: "Manouba",
    children: [
      {
        value: "douar_hicher",
        label: "Douar Hicher",
        children: [{ value: "centre", label: "Centre" }, { value: "el_intilaka", label: "El Intilaka" }],
      },
      {
        value: "manouba_ville",
        label: "Manouba Ville",
        children: [{ value: "citè_olfa", label: "Cité Olfa" }, { value: "citè_ennasr", label: "Cité Ennasr" }],
      },
    ],
  },
  {
    value: "nabeul",
    label: "Nabeul",
    children: [
      {
        value: "hammamet",
        label: "Hammamet",
        children: [{ value: "hammamet_nord", label: "Hammamet Nord" }, { value: "yasmine", label: "Yasmine Hammamet" }],
      },
      {
        value: "korba",
        label: "Korba",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "el_mida", label: "El Mida" }],
      },
    ],
  },
  {
    value: "bizerte",
    label: "Bizerte",
    children: [
      {
        value: "mateur",
        label: "Mateur",
        children: [{ value: "citè_menzel", label: "Cité Menzel" }, { value: "dowar_el_hout", label: "Douar El Hout" }],
      },
      {
        value: "bizerte_ville",
        label: "Bizerte Ville",
        children: [{ value: "zarzouna", label: "Zarzouna" }, { value: "sidi_salem", label: "Sidi Salem" }],
      },
    ],
  },
  {
    value: "zaghouan",
    label: "Zaghouan",
    children: [
      {
        value: "zaghouan_ville",
        label: "Zaghouan Ville",
        children: [{ value: "bir_chaaba", label: "Bir Chaâba" }, { value: "djebel", label: "Djebel Zaghouan" }],
      },
    ],
  },
  {
    value: "siliana",
    label: "Siliana",
    children: [
      {
        value: "bouarada",
        label: "Bouarada",
        children: [{ value: "centre", label: "Centre" }, { value: "zaghouan_route", label: "Route Zaghouan" }],
      },
      {
        value: "siliana_nord",
        label: "Siliana Nord",
        children: [{ value: "ain_bou_slama", label: "Aïn Bou Slama" }, { value: "bou_kornine", label: "Bou Kornine" }],
      },
    ],
  },
  {
    value: "beja",
    label: "Béja",
    children: [
      {
        value: "beja_nord",
        label: "Béja Nord",
        children: [{ value: "citè_el_bassatine", label: "Cité El Bassatine" }, { value: "beja_centre", label: "Centre Ville" }],
      },
      {
        value: "testour",
        label: "Testour",
        children: [{ value: "oued_zarga", label: "Oued Zarga" }, { value: "testour_centre", label: "Centre" }],
      },
    ],
  },
  {
    value: "jendouba",
    label: "Jendouba",
    children: [
      {
        value: "tabarka",
        label: "Tabarka",
        children: [{ value: "plage", label: "La Plage" }, { value: "port", label: "Le Port" }],
      },
      {
        value: "bou_salem",
        label: "Bou Salem",
        children: [{ value: "centre", label: "Centre" }, { value: "menzel_jemil", label: "Menzel Jemil" }],
      },
    ],
  },
  {
    value: "le_kef",
    label: "Le Kef",
    children: [
      {
        value: "kef_nord",
        label: "Kef Nord",
        children: [{ value: "citè_souk", label: "Cité Souk" }, { value: "kef_centre", label: "Centre Ville" }],
      },
    ],
  },
  {
    value: "sidi_bouzid",
    label: "Sidi Bouzid",
    children: [
      {
        value: "sidi_bouzid_ville",
        label: "Sidi Bouzid Ville",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "bir_el_hafey", label: "Bir El Hafey" }],
      },
    ],
  },
  {
    value: "kasserine",
    label: "Kasserine",
    children: [
      {
        value: "thala",
        label: "Thala",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "citè_menzel", label: "Cité Menzel" }],
      },
      {
        value: "feriana",
        label: "Fériana",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "bou_cheloufa", label: "Bou Cheloufa" }],
      },
    ],
  },
  {
    value: "kairouan",
    label: "Kairouan",
    children: [
      {
        value: "kairouan_ville",
        label: "Kairouan Ville",
        children: [{ value: "medina", label: "La Médina" }, { value: "citè_ibn_jazzar", label: "Cité Ibn Jazzar" }],
      },
    ],
  },
  {
    value: "gafsa",
    label: "Gafsa",
    children: [
      {
        value: "metlaoui",
        label: "Métlaoui",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "redeyef", label: "Redeyef" }],
      },
      {
        value: "gafsa_ville",
        label: "Gafsa Ville",
        children: [{ value: "sidi_ahmed", label: "Sidi Ahmed" }, { value: "citè_el_hadaya", label: "Cité El Hadaya" }],
      },
    ],
  },
  {
    value: "tozeur",
    label: "Tozeur",
    children: [
      {
        value: "nefta",
        label: "Nefta",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "degache", label: "Degache" }],
      },
      {
        value: "tozeur_ville",
        label: "Tozeur Ville",
        children: [{ value: "ras_el_ain", label: "Ras El Ain" }, { value: "el_hamma", label: "El Hamma" }],
      },
    ],
  },
  {
    value: "gabes",
    label: "Gabès",
    children: [
      {
        value: "gabes_ville",
        label: "Gabès Ville",
        children: [{ value: "chenguel", label: "Chenguel" }, { value: "ghannouch", label: "Ghannouch" }],
      },
      {
        value: "matmata",
        label: "Matmata",
        children: [{ value: "matmata_nouvelle", label: "Matmata Nouvelle" }, { value: "matmata_ancienne", label: "Matmata Ancienne" }],
      },
    ],
  },
  {
    value: "medenine",
    label: "Medenine",
    children: [
      {
        value: "zarzis",
        label: "Zarzis",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "el_amra", label: "El Amra" }],
      },
      {
        value: "medenine_ville",
        label: "Medenine Ville",
        children: [{ value: "sidi_makhlouf", label: "Sidi Makhlouf" }, { value: "citè_nakhil", label: "Cité Nakhil" }],
      },
    ],
  },
  {
    value: "tataouine",
    label: "Tataouine",
    children: [
      {
        value: "tataouine_ville",
        label: "Tataouine Ville",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "chenini", label: "Chenini" }],
      },
    ],
  },
  {
    value: "sousse",
    label: "Sousse",
    children: [
      {
        value: "hammam_sousse",
        label: "Hammam Sousse",
        children: [{ value: "khezama", label: "Khezama" }, { value: "cité_riadh", label: "Cité Riadh" }],
      },
      {
        value: "msaken",
        label: "Msaken",
        children: [{ value: "centre_ville", label: "Centre Ville" }, { value: "oued_el_ain", label: "Oued El Ain" }],
      },
    ],
  },
  {
    value: "monastir",
    label: "Monastir",
    children: [
      {
        value: "moknine",
        label: "Moknine",
        children: [{ value: "citè_essalem", label: "Cité Essalem" }, { value: "moknine_nord", label: "Moknine Nord" }],
      },
      {
        value: "monastir_ville",
        label: "Monastir Ville",
        children: [{ value: "sidi_mansour", label: "Sidi Mansour" }, { value: "khenis", label: "Khenis" }],
      },
    ],
  },
  {
    value: "mahdia",
    label: "Mahdia",
    children: [
      {
        value: "chebba",
        label: "Chebba",
        children: [{ value: "centre", label: "Centre Ville" }, { value: "sidi_zaid", label: "Sidi Zaid" }],
      },
      {
        value: "mahdia_ville",
        label: "Mahdia Ville",
        children: [{ value: "rezig", label: "Rezig" }, { value: "hiboun", label: "Hiboun" }],
      },
    ],
  },
  {
    value: "sfax",
    label: "Sfax",
    children: [
      {
        value: "sakiet_eddayer",
        label: "Sakiet Eddayer",
        children: [{ value: "el_ain", label: "El Ain" }, { value: "sakiet_eddayer_centre", label: "Sakiet Centre" }],
      },
      {
        value: "sfax_ville",
        label: "Sfax Ville",
        children: [{ value: "bab_bhar", label: "Bab Bhar" }, { value: "sidi_mansour", label: "Sidi Mansour" }],
      },
    ],
  },
];
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
const Auth = () => {

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[name,setName]=useState("");
    const[prenom,setPrenom]=useState("");
    const[isLogin,setIsLogin]=useState(true);
    const[role, setRole] = useState('');
    // mdp, role, image, phone, bio
    const[image,setImage]=useState("");
    const[phone,setPhone]=useState("");
    const[bio,setBio]=useState("");
    const[specialite,setspecialite]=useState('');
    const[ville,setVille]=useState('');
    const navigate=useNavigate();



  const [form] = Form.useForm();
  const onFinish = values => {
    console.log('Received values of form: ', values);
  };
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="+216">+216</Option>
        <Option value="+33">+33</Option>
        <Option value="+1">+1</Option>
      </Select>
    </Form.Item>
  );
  const [autoCompleteResult, setAutoCompleteResult] = useState([]);
  const onWebsiteChange = value => {
    setAutoCompleteResult(value ? ['.com', '.org', '.net'].map(domain => `${value}${domain}`) : []);
  };
  const websiteOptions = autoCompleteResult.map(website => ({
    label: website,
    value: website,
  }));
    const handleLogin= ()=>{
        try{
        fetch("http://localhost:4000/api/auth/login",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:'include',
            body:JSON.stringify({email:email,mdp:password})
        }).then(res=>res.json())
        .then(data=>{
            console.log(data);
            if (data.message && data.message.trim() === "Connexion réussie") {
              // Store token from response body
              if (data.token) {
                localStorage.setItem('token', data.token);
              }
              // Store user data
              if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
              }
              alert("Login successful");
              navigate("/");
    } else {
      alert(data.error || "Invalid credentials");
    }
        });
    }catch (err) {
    console.error("Login error:", err);
    alert("Login failed");
  }}
     const handleRegister =()=>{
        // Convert ville array to string (take the last element which is the most specific location)
        const villeString = Array.isArray(ville) ? ville[ville.length - 1] : ville;
        
        console.log('Registration data:', {
            nom: name,
            prenom: prenom,
            email: email,
            mdp: password,
            role: role,
            image: image,
            phone: phone,
            bio: bio,
            specialite: specialite,
            ville: villeString
        });
        
        fetch("http://localhost:4000/api/auth/register",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:'include',
            body:JSON.stringify({nom:name,prenom:prenom,email:email,mdp:password,role:role,image:image,phone:phone,bio:bio,specialite:specialite,ville:villeString})
        }).then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data.id){ // Check if user was created successfully
                alert("Registration successful");
                console.log("mrigil");
                navigate("/profile"); // Redirect to profile page after successful registration
                // Gérer l'inscription réussie ici
            } else if(data.error) {
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed');
        });
    }
  
    return (
        <div style={{
            minHeight: '100vh',
            
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                padding: '40px',
                width: '100%',
                maxWidth: isLogin ? '400px' : '600px',
                transition: 'max-width 0.3s ease'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h2 style={{
                        color: '#333',
                        fontSize: '28px',
                        fontWeight: '600',
                        margin: '0 0 10px 0'
                    }}>
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p style={{
                        color: '#666',
                        fontSize: '16px',
                        margin: '0'
                    }}>
                        {isLogin ? "Sign in to your account" : "Join our learning platform"}
                    </p>
                </div>

                {isLogin ? (
                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        style={{ width: '100%' }}
                    >
                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Email</span>}
                            name="email"
                            rules={[
                                { type: 'email', message: 'Please enter a valid email!' },
                                { required: true, message: 'Please input your email!' }
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    borderRadius: '10px',
                                    border: '2px solid #f0f0f0',
                                    padding: '12px 16px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Password</span>}
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    borderRadius: '10px',
                                    border: '2px solid #f0f0f0',
                                    padding: '12px 16px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: '20px' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleLogin}
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    borderRadius: '10px',
                                 
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                }}
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        layout="vertical"
                        style={{ width: '100%' }}
                        scrollToFirstError
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: '#333', fontWeight: '500' }}>First Name</span>}
                                    name="prenom"
                                    rules={[{ required: true, message: 'Please input your first name!' }]}
                                >
                                    <Input
                                        placeholder="First name"
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #f0f0f0',
                                            padding: '10px 12px'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: '#333', fontWeight: '500' }}>Last Name</span>}
                                    name="nom"
                                    rules={[{ required: true, message: 'Please input your last name!' }]}
                                >
                                    <Input
                                        placeholder="Last name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #f0f0f0',
                                            padding: '10px 12px'
                                        }}
                                        rules={[{ required: true, message: 'Please input your last name!' }]}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Email</span>}
                            name="email"
                            rules={[
                                { type: 'email', message: 'Please enter a valid email!' },
                                { required: true, message: 'Please input your email!' }
                            ]}
                        >
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0',
                                    padding: '10px 12px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Password</span>}
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                            hasFeedback
                        >
                            <Input.Password
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0',
                                    padding: '10px 12px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Confirm Password</span>}
                            name="confirm"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder="Confirm your password"
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0',
                                    padding: '10px 12px'
                                }}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: '#333', fontWeight: '500' }}>Role</span>}
                                    name="role"
                                    rules={[{ required: true, message: 'Please select your role!' }]}
                                >
                                    <Select
                                        placeholder="Select your role"
                                        value={role}
                                        onChange={(value) => setRole(value)}
                                        style={{
                                            borderRadius: '8px'
                                        }}
                                    > 
                                        <Option value="etudiant">etudiant</Option>
                                        <Option value="enseignant">enseignant</Option>
                                        <Option value="admin">admin</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item //'informatique', 'informatique', 'electrique', 'electrique'
                                    label={<span style={{ color: '#333', fontWeight: '500' }}>spécialité</span>}
                                    name="specialite"
                                    rules={[{ required: true, message: 'Please select your spécialité!' }]}
                                >
                                    <Select
                                        placeholder="Select your spécialité"
                                        value={specialite}
                                        onChange={(value) => setspecialite(value)}
                                        style={{
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Option value="informatique">informatique</Option>
                                        <Option value="mecanique">mecanique</Option>
                                        <Option value="electrique">electrique</Option>
                                        <Option value="civil">civil</Option>
                                    
                                    </Select>
                                </Form.Item>
                            </Col>
                            {/* <Col span={12}>
                                <Form.Item
                                    label={<span style={{ color: '#333', fontWeight: '500' }}>Gender</span>}
                                    name="gender"
                                    rules={[{ required: true, message: 'Please select gender!' }]}
                                >
                                    <Select
                                        placeholder="Select gender"
                                        style={{
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Option value="male">Male</Option>
                                        <Option value="female">Female</Option>
                                        <Option value="other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col> */}
                        </Row>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Phone Number</span>}
                            name="phone"
                            rules={[{ required: true, message: 'Please input your phone number!' }]}
                        >
                            <Input
                                addonBefore={prefixSelector}
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>ville</span>}
                            name="ville"
                            rules={[{ type: 'array', required: true, message: 'Please select your ville!' }]}
                        >
                            <Cascader
                                options={villes}
                                placeholder="Select your ville"
                                value={ville}
                                onChange={(value) => setVille(value)}
                                style={{
                                    borderRadius: '8px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Profile Image URL</span>}
                            name="image"
                        >
                            <Input
                                placeholder="Enter image URL (optional)"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0',
                                    padding: '10px 12px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: '#333', fontWeight: '500' }}>Bio</span>}
                            name="bio"
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Tell us about yourself"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    border: '2px solid #f0f0f0',
                                    padding: '10px 12px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="agreement"
                            valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value ? Promise.resolve() : Promise.reject(new Error('Please accept the agreement')),
                                },
                            ]}
                        >
                            <Checkbox style={{ color: '#666' }}>
                                I agree to the <a href="#" style={{ color: '#667eea' }}>Terms and Conditions</a>
                            </Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleRegister}
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(27, 195, 52, 1)5, 0, 1), 255rgba(40, 216, 24, 1)1)ff 0%rgba(19, 213, 68, 1)a2 100%)',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(9, 40, 182, 0.4)'
                                }}
                            >
                                Create Account
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <p style={{
                        color: '#666',
                        margin: '0 0 15px 0'
                    }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <Button
                        type="text"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            color: 'rgba(0, 0, 0, 1)',
                            fontWeight: '600',
                            fontSize: '16px',
                            padding: '0',
                            height: 'auto'
                        }}
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
export default Auth;
