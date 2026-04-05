import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from 'http-status';


const AuthContext = createContext({}); // global context for Authetication 

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users",
    withCredentials: true,
});

export const AuthProvider = ({children}) => {
    
    // const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    // Registration Logic that sends the user credentials to the backend

    const navigate = useNavigate();
    const handleRegister = async (username, email, password) =>{
        let request = await client.post('/register', {
            username: username,
            email: email,
            password: password
        })
        if(request.status === httpStatus.CREATED){
            request.data.message;
        }
        console.log(request.data);
        navigate("/home");
        return request.data;
    }
    const handleLogin = async (username, password)=>{
        try {
            let request = await client.post('/login', {
                username,
                password,
            })
            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                setToken(request.data.token);
                setUserData({ username }); // Mock user data for now
                navigate("/home");
            }
            console.log(request.data);
            return request.data;
        } catch (error) {
            console.log(error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUserData(null);
        navigate("/auth");
    }

    const data = {
        userData, setUserData, token, handleRegister, handleLogin, handleLogout
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;