import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';


export const useWebRTC = () => {
    const { connect, on, off, emit, getSocketId, disconnect } = useSocket();
    const mediaRequestRef = useRef(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteVideos, setRemoteVideos] = useState([]);
    const [messages, setMessages] = useState([]);

    // ICE Servers Ref (default to basic STUN)
    const iceServersRef = useRef([{ urls: "stun:stun.l.google.com:19302" }]);

    // Peer Connection Register
    const connectionRef = useRef({}); // Stores { [socketId]: { pc, makingOffer, ignoreOffer, isPolite } }

    // Handle Incoming Signals (offers/answers) & ICE candidates
    const handleSignal = useCallback(async (fromId, data) => {
        try {
            const signal = JSON.parse(data);
            const connection = connectionRef.current[fromId];
            if (!connection) return;

            const { pc, isPolite } = connection;

            if (signal.sdp) {
                const offerCollision = signal.sdp.type === "offer" && 
                    (connection.makingOffer || pc.signalingState !== "stable");

                connection.ignoreOffer = !isPolite && offerCollision;
                if (connection.ignoreOffer) {
                    console.log("Ignoring offer (impolite peer collision)");
                    return;
                }

                if (offerCollision) {
                    await Promise.all([
                        pc.setLocalDescription({ type: "rollback" }),
                        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                }

                if (signal.sdp.type === "offer") {
                    await pc.setLocalDescription();
                    emit("signal", fromId, JSON.stringify({ sdp: pc.localDescription }));
                }
            } else if (signal.iceCandidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.iceCandidate));
                } catch (err) {
                    if (!connection.ignoreOffer) throw err;
                }
            }
        } catch (error) {
            console.error("Signal Handling Error:", error);
        }
    }, [emit]);

    const createPeerConnection = useCallback((remoteSocketId, isPolite) => {
        const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
        
        // Register the connection with its individual state flags
        connectionRef.current[remoteSocketId] = {
            pc,
            isPolite,
            makingOffer: false,
            ignoreOffer: false
        };

        pc.onicecandidate = ((event) => {
            if (event.candidate) {
                emit("signal", remoteSocketId, JSON.stringify({ iceCandidate: event.candidate }));
            }
        });

        pc.ontrack = (event) => {
            setRemoteVideos((prev) => {
                const stream = event.streams[0];
                const existingPeer = prev.find(v => v.id === remoteSocketId);
                
                if (existingPeer) {
                    // Update the stream for the existing peer
                    return prev.map(v => v.id === remoteSocketId ? { ...v, stream } : v);
                }
                
                return [...prev, { id: remoteSocketId, stream }];
            });
        };

        pc.onnegotiationneeded = async () => {
            const conn = connectionRef.current[remoteSocketId];
            try {
                conn.makingOffer = true;
                await pc.setLocalDescription();
                emit("signal", remoteSocketId, JSON.stringify({ sdp: pc.localDescription }));
            } catch (error) {
                console.error("Negotiation Needed Error:", error);
            } finally {
                conn.makingOffer = false;
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "failed") {
                pc.restartIce();
            }
        };

        return pc;
    }, [emit]);

    const activeStreamRef = useRef(null);

    const getMedia = useCallback(async () => {
        if (mediaRequestRef.current) return;
        mediaRequestRef.current = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            activeStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            return null;
        } finally {
            mediaRequestRef.current = false;
        }
    }, []);

    const [screenSharing, setScreenSharing] = useState(false);

    const toggleScreenShare = useCallback(async () => {
        try {
            if (!screenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = stream.getVideoTracks()[0];

                Object.values(connectionRef.current).forEach(conn => {
                    const sender = conn.pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                setLocalStream(current => {
                    const audioTracks = current ? current.getAudioTracks() : [];
                    if (current) current.getVideoTracks().forEach(track => track.stop());
                    const newStream = new MediaStream([...audioTracks, screenTrack]);
                    activeStreamRef.current = newStream;
                    return newStream;
                });

                setScreenSharing(true);

                screenTrack.onended = () => {
                    setScreenSharing(false);
                    getMedia().then(cameraStream => {
                        if (cameraStream) {
                            const cameraTrack = cameraStream.getVideoTracks()[0];
                            Object.values(connectionRef.current).forEach(conn => {
                                const sender = conn.pc.getSenders().find(s => s.track && s.track.kind === 'video');
                                if (sender) sender.replaceTrack(cameraTrack);
                            });
                        }
                    });
                };
            } else {
                const cameraStream = await getMedia();
                if (cameraStream) {
                    const cameraTrack = cameraStream.getVideoTracks()[0];
                    Object.values(connectionRef.current).forEach(conn => {
                        const sender = conn.pc.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) sender.replaceTrack(cameraTrack);
                    });
                }
                setScreenSharing(false);
            }
        } catch (error) {
            console.error("Screen sharing failed:", error);
        }
    }, [screenSharing, getMedia]);

    const startMeeting = useCallback(async (username) => {
        try {
            let stream = localStream;
            if (!stream) {
                stream = await getMedia();
            }

            if (!stream) {
                console.error("Cannot start meeting without local stream");
                return;
            }

            // Fetch TURN servers from backend
            try {
                const apiBase = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/v1/users`;
                const response = await fetch(`${apiBase}/get_turn_servers`);
                const meteredIceServers = await response.json();
                iceServersRef.current = meteredIceServers;
                console.log("TURN Servers Loaded");
            } catch (err) {
                console.warn("Could not fetch TURN servers, using basic STUN", err);
            }

            connect();

            on("connect", () => {
                emit("join-call", window.location.href, username);
            });

            on("user-joined", (id, clients) => {
                const myId = getSocketId();
                clients.forEach((client) => {
                    const clientId = client.id;
                    if (clientId === myId || connectionRef.current[clientId]) return;

                    const isPolite = myId < clientId;
                    const pc = createPeerConnection(clientId, isPolite);
                    
                    // Store the username from the server payload
                    setRemoteVideos((prev) => {
                        const exists = prev.find(v => v.id === clientId);
                        if (exists) return prev;
                        return [...prev, { id: clientId, stream: null, username: client.username }];
                    });

                    if (activeStreamRef.current) {
                        activeStreamRef.current.getTracks().forEach((track) => {
                            pc.addTrack(track, activeStreamRef.current);
                        });
                    }
                });
            });

            on("signal", (fromId, data) => {
                handleSignal(fromId, data);
            });

            on("chat-message", (message, sender, socketId) => {
                setMessages(prev => [...prev, { 
                    sender, 
                    message, 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                }]);
            });

            on("user-left", (id) => {
                if (connectionRef.current[id]) {
                    connectionRef.current[id].pc.close();
                    delete connectionRef.current[id];
                    setRemoteVideos(prev => prev.filter(v => v.id !== id));
                }
            });
        } catch (error) {
            console.log(error);
        }
    }, [connect, on, emit, handleSignal, createPeerConnection, localStream, getMedia, getSocketId]);

    const sendMessage = useCallback((username, text) => {
        emit("chat-message", text, username);
    }, [emit]);

    const toggleAudio = useCallback((enabled) => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = enabled);
        }
    }, [localStream]);

    const toggleVideo = useCallback((enabled) => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = enabled);
        }
    }, [localStream]);

    const leaveMeeting = useCallback(() => {
        // 1. Stop all tracks using the Ref (reliable)
        if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach(track => {
                track.enabled = false; // Disable first
                track.stop();
                console.log(`Hardware track stopped: ${track.kind}`);
            });
            activeStreamRef.current = null;
        }
        setLocalStream(null);

        // 2. Close all peer connections
        Object.keys(connectionRef.current).forEach(id => {
            if (connectionRef.current[id]?.pc) {
                connectionRef.current[id].pc.close();
            }
            delete connectionRef.current[id];
        });

        setRemoteVideos([]);
        disconnect();
    }, [disconnect]);

    useEffect(() => {
        return () => {
            leaveMeeting();
        }
    }, [leaveMeeting]);


    return {
        localStream,
        remoteVideos,
        messages,
        sendMessage,
        toggleAudio,
        toggleVideo,
        getMedia,
        startMeeting,
        screenSharing,
        toggleScreenShare,
        leaveMeeting,
        participantCount: remoteVideos.length + 1
    }
}
