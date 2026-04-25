import { useRef, useCallback, useEffect } from 'react';
import { io } from "socket.io-client";

export const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
    if (window.location.hostname === 'localhost') return "http://localhost:8000";
    if (window.location.hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) return `http://${window.location.hostname}:8000`;
    return "https://focusroom-1.onrender.com";
};

export const server_url = "http://localhost:8000"

export const useSocket = ()=>{
    const socketRef = useRef();

    // The connect method
    const connect = useCallback(()=>{
        if(!socketRef.current){
            socketRef.current = io(server_url);
            console.log("Socket Connected", socketRef.current.id);
        }
        return socketRef.current;
    },[]);

    const disconnect = useCallback(()=>{
        if(socketRef.current){
            socketRef.current.disconnect();
            socketRef.current = null;
            console.log("Socket Disconnectd");
        }
    }, []);

    const emit = useCallback((event, ...args)=>{
        if(socketRef.current){
            socketRef.current.emit(event, ...args);
        }
    }, []);

    const on = useCallback((event, handler)=>{
        if(socketRef.current){
            socketRef.current.on(event, handler);
        }
    }, []);

    const off = useCallback((event, handler)=>{
        if(socketRef.current){
            socketRef.current.off(event, handler);
        }
    }, []);

    const getSocketId = useCallback(()=>{
        if(socketRef.current){
            return socketRef.current.id;
        }
        return null;
    }, []);
    useEffect(()=>{
        return ()=>{
            disconnect();
        }
    }, [disconnect]);

    return {
        connect,
        disconnect,
        emit,
        on,
        off,
        getSocketId,
        socket: socketRef.current
    }

}
