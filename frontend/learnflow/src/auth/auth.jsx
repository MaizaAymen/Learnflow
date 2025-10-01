import React from 'react';
import { useState } from 'react';

const Auth = () => {

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[name,setName]=useState("");
    const[isLogin,setIsLogin]=useState(true);
    const [role, setRole] = useState('');


    const handleLogin= ()=>{
        fetch("http://localhost:4000/api/auth/login",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,mdp:password})
        }).then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data.message==="Connexion réussie"){
                alert("login successful");
                // Gérer la connexion réussie ici
            }
        });
    }
     const handleRegister =()=>{
        fetch("http://localhost:4000/api/auth/register",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({nom:name,email,mdp:password,role:role})
        }).then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data.message==="Inscription réussie"){
                alert("Registration successful");
                // Gérer l'inscription réussie ici
            }
        });
    }

    
    return (
        <div>
            <h2>{isLogin ? "Login" : "Register"}</h2>
            {!isLogin && (
            <>

            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <label>Email:</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>Role:</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            </>
            )};
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
    <button onClick={isLogin ? handleLogin : handleRegister}>
        {isLogin ? "Login" : "Register"}
    </button>
    <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to Register" : "Switch to Login"}
    </button>
        
        
        
        
    
        </div>
    );
}
export default Auth;
