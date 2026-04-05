import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';


const peerConnectionConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
}

export const useWebRTC = () => {
    const { connect, on, off, emit, getSocketId, disconnect } = useSocket();

    const [localStream, setLocalStream] = useState(null);
    const [remoteVideos, setRemoteVideos] = useState([]);
    const [messages, setMessages] = useState([]);

    // Peer Connection Register
    const connectionRef = useRef({});

    // Flags for Perfect Negotiation
    const makingOfferRef = useRef(false);
    const ignoreOfferRef = useRef(false);

    // Handle Incoming Signals (offers/answers) & ICE candidates
    const handleSignal = useCallback(async (fromId, data) => {
        try {
            const signal = JSON.parse(data);
            const pc = connectionRef.current[fromId];
            if (!pc) return;

            if (signal.sdp) {
                const offerCollision = signal.sdp.type === "offer" && 
                    (makingOfferRef.current || pc.signalingState !== "stable");

                ignoreOfferRef.current = !pc.isPolite && offerCollision;
                if (ignoreOfferRef.current) {
                    console.log("Ignoring offer (impolite peer collision)");
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                if (signal.sdp.type === "offer") {
                    await pc.setLocalDescription();
                    emit("signal", fromId, JSON.stringify({ sdp: pc.localDescription }));
                }
            } else if (signal.iceCandidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.iceCandidate));
                } catch (err) {
                    if (!ignoreOfferRef.current) throw err;
                }
            }
        } catch (error) {
            console.error("Signal Handling Error:", error);
        }
    }, [emit]);

    const createPeerConnection = useCallback((remoteSocketId, isPolite) => {
        const pc = new RTCPeerConnection(peerConnectionConfig);
        pc.isPolite = isPolite; // Store politeness on the PC object

        pc.onicecandidate = ((event) => {
            if (event.candidate) {
                emit("signal", remoteSocketId, JSON.stringify({ iceCandidate: event.candidate }));
            }
        });

        pc.ontrack = (event) => {
            setRemoteVideos((prev) => {
                const exists = prev.find(v => v.id === remoteSocketId);
                if (exists) return prev;
                return [...prev, { id: remoteSocketId, stream: event.streams[0] }];
            });
        };

        pc.onnegotiationneeded = async () => {
            try {
                makingOfferRef.current = true;
                await pc.setLocalDescription();
                emit("signal", remoteSocketId, JSON.stringify({ sdp: pc.localDescription }));
            } catch (error) {
                console.error("Negotiation Needed Error:", error);
            } finally {
                makingOfferRef.current = false;
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "failed") {
                pc.restartIce();
            }
        };

        connectionRef.current[remoteSocketId] = pc;
        return pc;
    }, [emit]);

    const getMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            return null;
        }
    }, []);

    const [screenSharing, setScreenSharing] = useState(false);

    const toggleScreenShare = useCallback(async () => {
        try {
            if (!screenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = stream.getVideoTracks()[0];

                // Replace track in all peer connections
                Object.values(connectionRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                setLocalStream(current => {
                    const audioTracks = current ? current.getAudioTracks() : [];
                    // Stop current video tracks
                    if (current) current.getVideoTracks().forEach(track => track.stop());
                    return new MediaStream([...audioTracks, screenTrack]);
                });

                setScreenSharing(true);

                screenTrack.onended = () => {
                    setScreenSharing(false);
                    // Revert to camera
                    getMedia().then(cameraStream => {
                        if (cameraStream) {
                            const cameraTrack = cameraStream.getVideoTracks()[0];
                            Object.values(connectionRef.current).forEach(pc => {
                                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                                if (sender) sender.replaceTrack(cameraTrack);
                            });
                        }
                    });
                };
            } else {
                const cameraStream = await getMedia();
                if (cameraStream) {
                    const cameraTrack = cameraStream.getVideoTracks()[0];
                    Object.values(connectionRef.current).forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) sender.replaceTrack(cameraTrack);
                    });
                }
                setScreenSharing(false);
            }
        } catch (error) {
            console.error("Screen sharing failed:", error);
        }
    }, [screenSharing, getMedia]);

    // Start Meeting
    //  1. Get Media (if not already acquired) 2. Connect Socket 3. Join Room

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

            connect();

            on("connect", () => {
                emit("join-call", window.location.href);
            });

            on("user-joined", (id, clients) => {
                // TODO: Loop through clients, create PCS, add tracks
                const myId = getSocketId();
                clients.forEach((clientId) => {
                    if (clientId === myId || connectionRef.current[clientId]) return;

                    const isPolite = myId < clientId;
                    const pc = createPeerConnection(clientId, isPolite);
                    if (localStream) {
                        localStream.getTracks().forEach((track) => {
                            pc.addTrack(track, localStream);
                        });
                    }
                });
            });

            on("signal", handleSignal); //TODO: why we are not passing the parameters in the handleSignal function?

            on("chat-message", (message, sender, socketId) => {
                setMessages(prev => [...prev, { 
                    sender, 
                    message, 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                }]);
            });

            on("user-left", (id) => {
                if (connectionRef.current[id]) {
                    connectionRef.current[id].close();
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


    useEffect(() => {
        return () => {
            if (localStream) localStream.getTracks().forEach(track => track.stop());
            disconnect();
        }
    }, [localStream, disconnect]);


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
        participantCount: remoteVideos.length + 1
    }
}