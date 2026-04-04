import React from 'react';
import { Box, IconButton, Tooltip, Paper, useMediaQuery } from '@mui/material';
import {
  Mic, MicOff,
  Videocam, VideocamOff,
  ScreenShare, StopScreenShare,
  CallEnd,
  Chat, People,
  MoreVert
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';

const ControlBar = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile }) => ({
  position: 'fixed',
  bottom: isMobile ? theme.spacing(2) : theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  padding: isMobile ? theme.spacing(0.5, 1) : theme.spacing(1, 2),
  gap: isMobile ? theme.spacing(0.5) : theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.shadows[10],
  zIndex: 1000,
  transition: 'all 0.3s ease',
  width: isMobile ? '95%' : 'auto',
  justifyContent: isMobile ? 'space-between' : 'center',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  }
}));

const ActionButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, color, isMobile }) => ({
  width: isMobile ? 42 : 48,
  height: isMobile ? 42 : 48,
  backgroundColor: color === 'error' ? theme.palette.error.main : alpha(theme.palette.text.primary, 0.05),
  color: color === 'error' ? theme.palette.error.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: color === 'error' ? theme.palette.error.dark : alpha(theme.palette.text.primary, 0.1),
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease',
  '& .MuiSvgIcon-root': {
    fontSize: isMobile ? '1.2rem' : '1.5rem',
  }
}));

export default function MeetingControls({
  isMuted, onToggleMute,
  isVideoOff, onToggleVideo,
  isScreenSharing, onToggleScreenShare,
  onEndCall,
  onToggleChat,
  onToggleParticipants
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ControlBar elevation={0} isMobile={isMobile}>
      <Tooltip title={isMuted ? "Unmute" : "Mute"}>
        <ActionButton onClick={onToggleMute} color={isMuted ? "error" : "default"} isMobile={isMobile}>
          {isMuted ? <MicOff /> : <Mic />}
        </ActionButton>
      </Tooltip>

      <Tooltip title={isVideoOff ? "Start Video" : "Stop Video"}>
        <ActionButton onClick={onToggleVideo} color={isVideoOff ? "error" : "default"} isMobile={isMobile}>
          {isVideoOff ? <VideocamOff /> : <Videocam />}
        </ActionButton>
      </Tooltip>

      {!isMobile && (
        <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
          <ActionButton onClick={onToggleScreenShare} color={isScreenSharing ? "primary" : "default"} isMobile={isMobile}>
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </ActionButton>
        </Tooltip>
      )}

      <Box sx={{ width: 1, height: 24, mx: isMobile ? 0.5 : 1, borderLeft: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }} />

      <Tooltip title="Chat">
        <ActionButton onClick={onToggleChat} isMobile={isMobile}>
          <Chat />
        </ActionButton>
      </Tooltip>

      {!isMobile && (
        <Tooltip title="Participants">
          <ActionButton onClick={onToggleParticipants} isMobile={isMobile}>
            <People />
          </ActionButton>
        </Tooltip>
      )}

      <Tooltip title="More Options">
        <ActionButton isMobile={isMobile}>
          <MoreVert />
        </ActionButton>
      </Tooltip>

      <Box sx={{ width: 1, height: 24, mx: isMobile ? 0.5 : 1, borderLeft: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }} />

      <Tooltip title="Leave Call">
        <ActionButton onClick={onEndCall} color="error" sx={{ borderRadius: '12px' }} isMobile={isMobile}>
          <CallEnd />
        </ActionButton>
      </Tooltip>
    </ControlBar>
  );
}
