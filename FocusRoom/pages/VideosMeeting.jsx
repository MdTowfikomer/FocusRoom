import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Box, AppBar, Toolbar, Typography,
  IconButton, Drawer, Divider, TextField, Paper, Tooltip, Stack, Chip, useMediaQuery
} from '@mui/material';
import {
  Chat as ChatIcon, People, Close, Send,
  NavigateBefore, InfoOutlined, DarkMode, LightMode
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';

import { useWebRTC } from '../hooks/useWebRTC';

import Lobby from '../components/Lobby';
import VideoTile from '../components/VideoTile';
import MeetingControls from '../components/MeetingControls';




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

  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    localStream,
    remoteVideos,
    messages,
    sendMessage: sendChatMessage,
    toggleAudio,
    toggleVideo,
    getMedia,
    startMeeting,
    screenSharing,
    toggleScreenShare,
    participantCount
  } = useWebRTC();

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const mediaRequestInProgress = useRef(false);

  useEffect(() => {
    if (askForUsername && !localStream) {
      getMedia();
    }
  }, [askForUsername, localStream, getMedia]);



  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => track.enabled = videoEnabled);
    localStream.getAudioTracks().forEach(track => track.enabled = audioEnabled);
  }, [localStream, videoEnabled, audioEnabled]);

  // Action Handlers

  const handleJoin = () => {
    setAskForUsername(false);
    startMeeting(username);
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      sendChatMessage(username, message);
      setMessage("");
    }
  }

  const handleScreen = () => {
    toggleScreenShare();
  }


  const handleEndCall = () => {
    window.location.href = "/home";
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
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: 'primary.main', 
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'text.primary', 
              fontWeight: 800, 
              fontFamily: '"Plus Jakarta Sans", sans-serif', 
              fontSize: isMobile ? '0.9rem' : '1.1rem', 
              letterSpacing: -0.5,
              textTransform: 'none'
            }}>
              FocusRoom
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.4, 
              fontFamily: '"Space Mono", monospace', 
              ml: 2,
              display: isMobile ? 'none' : 'block'
            }}>
              // SESSION_{window.location.pathname.split('/').pop()?.substring(0, 4).toUpperCase()}
            </Typography>
          </Stack>
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
              {remoteVideos.map((v) => (
                <VideoTile
                  key={v.id}
                  username={`${username}`}
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
                  username={`${username}`}
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
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2 }}>Chats</Typography>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' } }}
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={!message.trim()} sx={{ border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </ChatDrawer>
      </MainContent>

      <MeetingControls
        isMuted={!audioEnabled}
        onToggleMute={() => {
          const nextState = !audioEnabled;
          setAudioEnabled(nextState);
          toggleAudio(nextState);
        }}
        isVideoOff={!videoEnabled}
        onToggleVideo={() => {
          const nextState = !videoEnabled;
          setVideoEnabled(nextState);
          toggleVideo(nextState);
        }}
        isScreenSharing={screenSharing}
        onToggleScreenShare={handleScreen}
        onEndCall={handleEndCall}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => { }}
      />
    </MeetingWrapper>
  );
}
