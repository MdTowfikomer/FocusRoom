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
        const signal = JSON.parse(data);
        const pc = connectionRef.current[fromId];
        if (!pc) return;

        try {
            // TODO: Implement "Perfect Negotiation" logic here
            // 1. Check for collisions (Offer/Offer)
            if (signal.sdp) {
                const offerCollision = signal.sdp.type === "offer" && makingOfferRef.current && !ignoreOfferRef.current;
                if (offerCollision) {
                    ignoreOfferRef.current = true;
                    console.log("Ignoring offer (impolite peer)");
                    return;
                }
                // 2. Set remote description
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                // 3. Create answer if it was an offer
                if (signal.sdp.type === "offer") {
                    pc.createAnswer()
                        .then((description) => {
                            pc.setLocalDescription(description)
                                .then(() => {
                                    emit("signal", fromId, JSON.stringify({ sdp: pc.localDescription }));
                                })
                        })
                }
            } else if (signal.iceCandidate) {
                await pc.addIceCandidate(new RTCIceCandidate(signal.iceCandidate));
            }
        } catch (error) {
            if (!ignoreOfferRef.current) console.error("ICE Error", error)
        }
    }, []);

    const createPeerConnection = useCallback((remoteSocketId, isPolite) => { //TODO: why we use isPolite?
        const pc = new RTCPeerConnection(peerConnectionConfig);
        // TODO: Implement Event Listeners
        // 1. onicecandidate -> emit signal with candidate
        pc.onicecandidate = ((event) => {
            if (event.candidate) {
                emit("signal", remoteSocketId, JSON.stringify({ iceCandidate: event.candidate }));
            }
        });
        // 2. ontrack -> update remoteVideos state
        pc.ontrack = (event) => {
            if (event.track.kind != 'video') return;
            setRemoteVideos((prev) => {
                let exists = prev.find(v => v.id === remoteSocketId);
                if (exists) return prev;
                return [...prev, { id: remoteSocketId, stream: event.streams[0] }]
            });
        }
        // 3. onnegotiationneeded -> implement the "Perfect Negotiation" offer logic
        pc.onnegotiationneeded = async () => {
            if (makingOfferRef.current) return;
            makingOfferRef.current = true;
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit("signal", remoteSocketId, JSON.stringify({ sdp: pc.localDescription }));
            } catch (error) {
                console.log(error);
            } finally {
                makingOfferRef.current = false;
            }
        }

        connectionRef.current[remoteSocketId] = pc;
        return pc;
    }, [emit, localStream]);

    // Start Meetin
    //  1. Get Media 2. Connect Socket 3. Join Room

    const startMeeting = useCallback(async (username) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const socket = connect();

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

            on("chat-message", (data) => {
                setMessages(prev => [...prev, data]);
            });

            on("user-left", (id) => {
                if (connectionRef.current[id]) {
                    connectionRef.current[id].close();
                    delete connectionRef.current[id]; //TODO: why we are deleting the connection?
                    setRemoteVideos(prev => prev.filter(v => v.id !== id)); // if condition fall it will remove video right?
                }
            });
        } catch (error) {
            console.log(error);
        }
    }, [connect, on, emit, handleSignal, createPeerConnection]); // why createPeerConnection ?

    const sendMessage = useCallback((username, text) => {
        const data = { sender: username, message: text, time: new Date().toLocaleTimeString() };

        emit("chat-message", data);
        setMessages((prev) => [...prev, data]);
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
        startMeeting,
        participantCount: remoteVideos.length + 1
    }
}