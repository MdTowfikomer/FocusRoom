import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { MicOff, VideocamOff, MoreVert } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const TileContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isPIP',
})(({ theme, isPIP }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  borderRadius: isPIP ? theme.shape.borderRadius * 3 : theme.shape.borderRadius * 2,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: isPIP ? theme.shadows[12] : theme.shadows[2],
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    boxShadow: theme.shadows[10],
  },
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const HUDOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  zIndex: 2,
}));

const Badge = styled(Box)(({ theme, type }) => ({
  backgroundColor: type === 'error' ? alpha(theme.palette.error.main, 0.8) : alpha('#000', 0.6),
  color: '#fff',
  padding: theme.spacing(0.4, 1),
  borderRadius: 4,
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  border: `1px solid ${alpha('#fff', 0.1)}`,
  width: 'fit-content',
}));

const TechPlaceholder = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
    animation: 'spin 10s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));

const AvatarCircle = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  fontSize: '1.8rem',
  fontWeight: 700,
  fontFamily: 'monospace',
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  zIndex: 1,
}));

export default function VideoTile({ stream, username, isLocal, isMuted, isVideoOff, isPIP }) {
  return (
    <TileContainer elevation={0} isPIP={isPIP}>
      {!isVideoOff && stream ? (
        <VideoElement
          ref={(el) => {
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
              el.play().catch(e => console.log('Video tile play error:', e));
            }
          }}
          autoPlay
          muted={isLocal}
          playsInline
          style={{ transform: isLocal ? 'rotateY(180deg)' : 'none' }}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <TechPlaceholder>
            <AvatarCircle>
              {username ? username.charAt(0).toUpperCase() : '?'}
            </AvatarCircle>
          </TechPlaceholder>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', letterSpacing: 1 }}>
            {isVideoOff ? 'FEED_OFFLINE' : 'WAITING_FOR_STREAM'}
          </Typography>
        </Box>
      )}

      <HUDOverlay>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Badge>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.65rem' }}>
              {isLocal ? 'HOST_CLIENT' : 'REMOTE_PEER'}
            </Typography>
          </Badge>
          <Box sx={{ pointerEvents: 'auto' }}>
            <IconButton size="small" sx={{ color: 'white', bgcolor: alpha('#000', 0.3), '&:hover': { bgcolor: alpha('#000', 0.5) } }}>
              <MoreVert fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Badge sx={{ bgcolor: alpha(isMuted ? '#f44336' : '#000', 0.6) }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>
              {username || (isLocal ? "YOU" : "GUEST")}
            </Typography>
            {isMuted && <MicOff sx={{ fontSize: 14 }} />}
          </Badge>
        </Box>
      </HUDOverlay>
    </TileContainer>
  );
}
