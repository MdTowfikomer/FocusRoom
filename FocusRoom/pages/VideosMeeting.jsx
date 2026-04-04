import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Box, AppBar, Toolbar, Typography,
  IconButton, Drawer, Divider, TextField, Paper, Tooltip, Stack, Chip, useMediaQuery
} from '@mui/material';
import {
  Chat as ChatIcon, People, Close, Send,
  NavigateBefore, InfoOutlined, DarkMode, LightMode
} from '@mui/icons-material';
import { io } from "socket.io-client";
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';

import { useWebRTC } from '../hooks/useWebRTC';

import Lobby from '../components/Lobby';
import VideoTile from '../components/VideoTile';
import MeetingControls from '../components/MeetingControls';

const server_url = "http://localhost:8000";



const MeetingWrapper = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  color: theme.palette.text.primary,
}));

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
});

// Dynamic Grid System based on N participants and Screen Size
const DynamicGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'count' && prop !== 'isMobile',
})(({ theme, count, isMobile }) => {
  const common = {
    flex: 1,
    padding: isMobile ? theme.spacing(1) : theme.spacing(2),
    display: 'grid',
    gap: isMobile ? theme.spacing(1) : theme.spacing(2),
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    height: '100%',
    width: '100%',
  };

  // Solo Layout
  if (count <= 1) {
    return {
      ...common,
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
      maxWidth: isMobile ? '100%' : '1200px',
      margin: '0 auto',
    };
  }

  // Dual Layout (PIP)
  if (count === 2) {
    return {
      ...common,
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
      padding: 0, 
    };
  }

  // Trio Layout (Pyramid)
  if (count === 3) {
    return {
      ...common,
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gridTemplateRows: isMobile ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
      '& > div:last-child': {
        gridColumn: isMobile ? 'span 1' : 'span 2',
        justifySelf: 'center',
        width: isMobile ? '100%' : 'calc(50% - 8px)',
      }
    };
  }

  // Quad Layout (2x2)
  return {
    ...common,
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
  };
});

const PIPContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile }) => ({
  position: 'absolute',
  bottom: isMobile ? theme.spacing(12) : theme.spacing(4),
  right: isMobile ? theme.spacing(2) : theme.spacing(4),
  width: isMobile ? '120px' : '280px',
  height: isMobile ? '180px' : '180px',
  zIndex: 10,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ChatDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile }) => ({
  width: isMobile ? '100%' : 360,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: isMobile ? '100%' : 360,
    boxSizing: 'border-box',
    borderLeft: isMobile ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
  },
}));

export default function VideosMeeting() {
  
  
const {localStream, remoteVideos, messages, sendMessage, toggleAudio, toggleVideo, startMeeting, participantCount} = useWebRTC();
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);


  const mediaRequestInProgress = useRef(false);

  // const participantCount = useMemo(() => videos.length + 1, [videos]);

  const getPermission = useCallback(async () => {
    if (mediaRequestInProgress.current || localStream) return;
    mediaRequestInProgress.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
    } catch (error) {
      console.log("Hardware access failed:", error);
    } finally {
      mediaRequestInProgress.current = false;
    }
  }, [localStream]);

  useEffect(() => {
    getPermission();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [getPermission, localStream]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => track.enabled = videoEnabled);
    localStream.getAudioTracks().forEach(track => track.enabled = audioEnabled);
  }, [localStream, videoEnabled, audioEnabled]);

  const connectToSocketServer = () => {
    socketRef.current = io(server_url);

    socketRef.current.on('signal', (fromId, message) => {
      let signal = JSON.parse(message);
      if (fromId === socketIdRef.current) return;

      if (signal.sdp) {
        if (!connections[fromId]) return;
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer()
                .then((description) => {
                  connections[fromId].setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit("signal", fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                    })
                });
            }
          });
      }
      if (signal.ice) {
        if (!connections[fromId]) return;
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit('join-call', window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data) => {
        setMessages(prev => [...prev, data]);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter(v => v.socketId !== id));
        delete connections[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketIdList) => {
          if (connections[socketIdList]) return;

          connections[socketIdList] = new RTCPeerConnection(peerConnectionConfig);

          connections[socketIdList].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit("signal", socketIdList, JSON.stringify({ 'ice': event.candidate }));
            }
          }

          connections[socketIdList].ontrack = (event) => {
            if (event.track.kind !== 'video') return;
            setVideos((prev) => {
              const exists = prev.find(v => v.socketId === socketIdList);
              if (exists) return prev.map(v => v.socketId === socketIdList ? { ...v, stream: event.streams[0] } : v);
              return [...prev, { socketId: socketIdList, stream: event.streams[0] }];
            });
          }

          if (localStream) {
            localStream.getTracks().forEach(track => connections[socketIdList].addTrack(track, localStream));
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            connections[id2].createOffer().then(desc => {
              connections[id2].setLocalDescription(desc).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
              });
            });
          }
        }
      });
    });
  }

  const handleJoin = () => {
    setAskForUsername(false);
    connectToSocketServer();
  }


  const handleEndCall = () => {
    window.location.href = "/";
  }

  if (askForUsername) {
    return (
      <Lobby
        username={username} setUsername={setUsername}
        videoEnabled={videoEnabled} setVideoEnabled={setVideoEnabled}
        audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled}
        onJoin={handleJoin}
        localStream={localStream}
      />
    );
  }

  return (
    <MeetingWrapper>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: alpha(theme.palette.divider, 0.1) }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 800, fontFamily: 'Space Mono, monospace', fontSize: isMobile ? '0.7rem' : '0.9rem', letterSpacing: isMobile ? 1 : 2 }}>
            {isMobile ? 'FOCUS_OS' : 'FOCUS_ROOM_OS'} // SESSION_{window.location.pathname.split('/').pop()?.substring(0, 4).toUpperCase()}
          </Typography>
          <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center">
            <IconButton onClick={toggleColorMode} size="small" sx={{ border: 1, borderColor: alpha(theme.palette.divider, 0.1) }}>
              {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
            {!isMobile && (
              <Chip
                label={`${participantCount} PEERS_CONNECTED`}
                size="small"
                sx={{ fontWeight: 700, fontFamily: 'Space Mono, monospace', borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
              />
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <MainContent>
        <DynamicGrid count={participantCount} isMobile={isMobile}>
          {participantCount === 2 ? (
            <>
              {videos.map((v) => (
                <VideoTile
                  key={v.socketId}
                  username={`PEER_${v.socketId.substring(0, 4).toUpperCase()}`}
                  stream={v.stream}
                />
              ))}
              <PIPContainer isMobile={isMobile}>
                <VideoTile
                  isLocal
                  isPIP
                  username={`${username} (YOU)`}
                  stream={localStream}
                  isMuted={!audioEnabled}
                  isVideoOff={!videoEnabled}
                />
              </PIPContainer>
            </>
          ) : (
            <>
              <VideoTile
                isLocal
                username={`${username} (YOU)`}
                stream={localStream}
                isMuted={!audioEnabled}
                isVideoOff={!videoEnabled}
              />
              {remoteVideos.map((v) => (
                <VideoTile
                  key={v.id}
                  username={`PEER_${v.id.substring(0, 4).toUpperCase()}`}
                  stream={v.stream}
                />
              ))}
            </>
          )}
        </DynamicGrid>

        <ChatDrawer
          anchor={isMobile ? "bottom" : "right"}
          open={showChat}
          variant="persistent"
          isMobile={isMobile}
          sx={{ height: isMobile ? '80vh' : 'auto' }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2 }}>Comm_Log</Typography>
            <IconButton onClick={() => setShowChat(false)} size="small"><Close fontSize="small" /></IconButton>
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ alignSelf: m.sender === username ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontFamily: 'Space Mono, monospace', mb: 0.5, display: 'block', fontSize: '0.65rem' }}>
                  [{m.sender.toUpperCase()}] {'>'} {m.time}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: m.sender === username ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.primary, 0.03),
                    border: `1px solid ${m.sender === username ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{m.message}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
          <Box sx={{ p: 2, display: 'flex', gap: 1, mb: isMobile ? 4 : 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="INPUT_MESSAGE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' } }}
            />
            <IconButton color="primary" onClick={sendMessage} disabled={!message.trim()} sx={{ border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </ChatDrawer>
      </MainContent>

      <MeetingControls
        isMuted={!audioEnabled}
        onToggleMute={() => setAudioEnabled(!audioEnabled)}
        isVideoOff={!videoEnabled}
        onToggleVideo={() => setVideoEnabled(!videoEnabled)}
        isScreenSharing={screenSharing}
        onToggleScreenShare={() => setScreenSharing(!screenSharing)}
        onEndCall={handleEndCall}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => { }}
      />
    </MeetingWrapper>
  );
}
