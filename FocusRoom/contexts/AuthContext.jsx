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
    
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);
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
        let request = await client.post('/login', {
            username,
            password,
        })
        if(request.status === httpStatus.OK){
            localStorage.setItem("token", request.data.token);
        }
        console.log(request.data);
        navigate("/home");
        return request.data;
    }

    const data = {
        userData, setUserData, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;