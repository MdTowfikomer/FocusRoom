import { useRef, useCallback, useEffect } from 'react';
import { io } from "socket.io-client";

const server_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";


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
