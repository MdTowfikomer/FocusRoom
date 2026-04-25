import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket, server_url } from './useSocket';
import { MediaService } from '../utils/MediaService';
import { PeerManager } from '../utils/PeerManager';

export const useWebRTC = () => {
    const { connect, on, emit, getSocketId, disconnect } = useSocket();
    
    // UI State
    const [localStream, setLocalStream] = useState(null);
    const [remoteVideos, setRemoteVideos] = useState([]);
    const [messages, setMessages] = useState([]);
    const [joinTime, setJoinTime] = useState("");
    const [screenSharing, setScreenSharing] = useState(false);

    // Refs for Manager and Stream Sync
    const peerManagerRef = useRef(null);
    const activeStreamRef = useRef(null);

    // 1. Initialize PeerManager
    const initPeerManager = useCallback((iceServers) => {
        const manager = new PeerManager(iceServers);
        
        // Wire up callbacks to Socket and React State
        manager.onSignal = (id, data) => emit("signal", id, data);
        
        manager.onStream = (id, stream) => {
            setRemoteVideos(prev => {
                const exists = prev.find(v => v.id === id);
                if (exists) return prev.map(v => v.id === id ? { ...v, stream } : v);
                return [...prev, { id, stream }];
            });
        };

        manager.onRemoveStream = (id) => {
            setRemoteVideos(prev => prev.filter(v => v.id !== id));
        };

        peerManagerRef.current = manager;
    }, [emit]);

    const getMedia = useCallback(async () => {
        try {
            const stream = await MediaService.getCameraStream();
            activeStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            return null;
        }
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (!screenSharing) {
            try {
                const stream = await MediaService.getDisplayStream();
                const screenTrack = stream.getVideoTracks()[0];
                
                peerManagerRef.current?.replaceLocalTracks(stream);

                setLocalStream(current => {
                    const audioTracks = current ? current.getAudioTracks() : [];
                    if (current) current.getVideoTracks().forEach(t => t.stop());
                    const newStream = new MediaStream([...audioTracks, screenTrack]);
                    activeStreamRef.current = newStream;
                    return newStream;
                });

                setScreenSharing(true);
                screenTrack.onended = () => {
                    setScreenSharing(false);
                    getMedia().then(camStream => camStream && peerManagerRef.current?.replaceLocalTracks(camStream));
                };
            } catch (err) {
                console.error("Screen share failed", err);
            }
        } else {
            const camStream = await getMedia();
            if (camStream) peerManagerRef.current?.replaceLocalTracks(camStream);
            setScreenSharing(false);
        }
    }, [screenSharing, getMedia]);

    const startMeeting = useCallback(async (username) => {
        let stream = activeStreamRef.current || await getMedia();
        if (!stream) return;

        // Fetch TURN servers
        let iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
        try {
            const response = await fetch(`${server_url}/api/v1/users/get_turn_servers`);
            const data = await response.json();
            iceServers = data.slice(0, 4);
        } catch (err) {
            console.warn("Using fallback STUN");
        }

        initPeerManager(iceServers);
        connect();

        on("connect", () => {
            emit("join-call", window.location.href, username);
        });

        on("user-joined", (id, clients) => {
            const myId = getSocketId();
            clients.forEach(client => {
                if (client.id === myId || peerManagerRef.current?.connections[client.id]) return;
                
                // Add to UI list for username display even if stream hasn't arrived
                setRemoteVideos(prev => {
                    if (prev.find(v => v.id === client.id)) return prev;
                    return [...prev, { id: client.id, stream: null, username: client.username }];
                });

                peerManagerRef.current?.addPeer(client.id, myId < client.id, activeStreamRef.current);
            });
        });

        on("signal", (fromId, data) => peerManagerRef.current?.handleSignal(fromId, data));

        on("chat-message", (message, sender) => {
            setMessages(prev => [...prev, { 
                sender, message, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        });

        on("user-left", (id) => peerManagerRef.current?.removePeer(id));

    }, [connect, on, emit, getSocketId, initPeerManager, getMedia]);

    const leaveMeeting = useCallback(() => {
        MediaService.stopStream(activeStreamRef.current);
        activeStreamRef.current = null;
        setLocalStream(null);
        peerManagerRef.current?.closeAll();
        setRemoteVideos([]);
        disconnect();
    }, [disconnect]);

    useEffect(() => {
        return () => leaveMeeting();
    }, [leaveMeeting]);

    return {
        localStream,
        remoteVideos,
        messages,
        sendMessage: (user, text) => emit("chat-message", text, user),
        toggleAudio: (on) => MediaService.toggleTrack(activeStreamRef.current, 'audio', on),
        toggleVideo: (on) => MediaService.toggleTrack(activeStreamRef.current, 'video', on),
        getMedia,
        startMeeting,
        screenSharing,
        toggleScreenShare,
        leaveMeeting,
        joinTime,
        participantCount: remoteVideos.length + 1
    };
}
