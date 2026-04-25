import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
    const webrtc = useWebRTC();
    
    // UI-specific state that doesn't belong in the WebRTC logic
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showShare, setShowShare] = useState(false);

    // Sync hardware state with UI toggles
    useEffect(() => {
        if (webrtc.localStream) {
            webrtc.toggleVideo(videoEnabled);
            webrtc.toggleAudio(audioEnabled);
        }
    }, [webrtc.localStream, videoEnabled, audioEnabled]);

    const value = {
        ...webrtc,
        videoEnabled,
        setVideoEnabled,
        audioEnabled,
        setAudioEnabled,
        showChat,
        setShowChat,
        showShare,
        setShowShare,
    };

    return (
        <MeetingContext.Provider value={value}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeeting = () => {
    const context = useContext(MeetingContext);
    if (!context) {
        throw new Error('useMeeting must be used within a MeetingProvider');
    }
    return context;
};
