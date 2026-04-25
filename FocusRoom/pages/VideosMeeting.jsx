import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography,
  IconButton, Stack, Chip, useMediaQuery
} from '@mui/material';
import {
  DarkMode, LightMode
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';
import { MeetingProvider, useMeeting } from '../contexts/MeetingContext';

import Lobby from '../components/Lobby';
import VideoTile from '../components/VideoTile';
import MeetingControls from '../components/MeetingControls';
import ChatDrawer from '../components/ChatDrawer';
import ShareDrawer from '../components/ShareDrawer';

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
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
});

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

  if (count <= 1) return { ...common, gridTemplateColumns: '1fr', gridTemplateRows: '1fr', maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto' };
  if (count === 2) return { ...common, gridTemplateColumns: '1fr', gridTemplateRows: '1fr', padding: 0 };
  if (count === 3) return {
      ...common,
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gridTemplateRows: isMobile ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
      '& > div:last-child': { gridColumn: isMobile ? 'span 1' : 'span 2', justifySelf: 'center', width: isMobile ? '100%' : 'calc(50% - 8px)' }
  };
  return { ...common, gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
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
  '&:hover': { transform: 'scale(1.05)' },
}));

function MeetingRoom() {
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const {
    localStream, remoteVideos, participantCount,
    videoEnabled, audioEnabled,
    startMeeting, leaveMeeting
  } = useMeeting();

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    setAskForUsername(false);
    startMeeting(username);
  };

  const handleEndCall = () => {
    leaveMeeting();
    navigate("/home");
  };

  if (askForUsername) {
    return <Lobby username={username} setUsername={setUsername} onJoin={handleJoin} />;
  }

  return (
    <MeetingWrapper>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: alpha(theme.palette.divider, 0.1) }}>
        <Toolbar variant="dense">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (theme) => `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}` }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: isMobile ? '0.9rem' : '1.1rem', letterSpacing: -0.5, textTransform: 'none' }}>
              FocusRoom
            </Typography>
          </Stack>
          <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center">
            <IconButton onClick={toggleColorMode} size="small" sx={{ border: 1, borderColor: alpha(theme.palette.divider, 0.1) }}>
              {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
            {!isMobile && (
              <Chip label={`${participantCount} PEERS_CONNECTED`} size="small" sx={{ fontWeight: 700, fontFamily: 'Space Mono, monospace', borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }} />
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <MainContent>
        <DynamicGrid count={participantCount} isMobile={isMobile}>
          {participantCount === 2 ? (
            <>
              {remoteVideos.map((v) => (
                <VideoTile key={v.id} username={v.username || `PEER_${v.id.substring(0, 4).toUpperCase()}`} stream={v.stream} />
              ))}
              <PIPContainer isMobile={isMobile}>
                <VideoTile isLocal isPIP username={`${username} (YOU)`} stream={localStream} isMuted={!audioEnabled} isVideoOff={!videoEnabled} />
              </PIPContainer>
            </>
          ) : (
            <>
              <VideoTile isLocal username={`${username} (YOU)`} stream={localStream} isMuted={!audioEnabled} isVideoOff={!videoEnabled} />
              {remoteVideos.map((v) => (
                <VideoTile key={v.id} username={v.username || `PEER_${v.id.substring(0, 4).toUpperCase()}`} stream={v.stream} />
              ))}
            </>
          )}
        </DynamicGrid>

        <ChatDrawer isMobile={isMobile} username={username} />
        <ShareDrawer />
      </MainContent>

      <MeetingControls onEndCall={handleEndCall} />
    </MeetingWrapper>
  );
}

export default function VideosMeeting() {
    return (
        <MeetingProvider>
            <MeetingRoom />
        </MeetingProvider>
    );
}
