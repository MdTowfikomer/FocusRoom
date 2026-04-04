import React from 'react';
import { Box, Typography, TextField, Button, IconButton, Tooltip, Fade } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, ScreenShare, DarkMode, LightMode } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';
import { useTheme } from '@mui/material/styles';

/* ─── Styled Components ─── */

const LobbyWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'hidden',
  padding: theme.spacing(2, 3),
  background: theme.palette.background.default,
  transition: 'background 0.3s ease',
}));

const ContentColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 560,
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(2),
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  flex: 1,
  minHeight: 0,
  borderRadius: theme.shape.borderRadius * 2.5,
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.04)
    : '#f1f5f9',
  border: `1px solid ${theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.08)
    : alpha(theme.palette.common.black, 0.06)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`
    : `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
}));

const PreviewVideo = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: 'rotateY(180deg)',
});

const ControlBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  flexShrink: 0,
}));

const ControlBtn = styled(IconButton)(({ theme, active }) => ({
  width: 48,
  height: 48,
  border: `1.5px solid ${active === 'true'
    ? (theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.15)
      : alpha(theme.palette.common.black, 0.12))
    : theme.palette.error.main
    }`,
  color: active === 'true'
    ? theme.palette.text.primary
    : theme.palette.error.main,
  backgroundColor: active === 'true'
    ? 'transparent'
    : alpha(theme.palette.error.main, 0.06),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active === 'true'
      ? (theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.06)
        : alpha(theme.palette.common.black, 0.04))
      : alpha(theme.palette.error.main, 0.12),
    transform: 'translateY(-1px)',
  },
}));

const JoinButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '14px 24px',
  borderRadius: theme.shape.borderRadius * 1.5,
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.06)
      : alpha(theme.palette.common.black, 0.06),
    color: theme.palette.text.disabled,
  },
}));

const ThemeToggle = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: 24,
  right: 24,
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: `1px solid ${theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.1)
    : alpha(theme.palette.common.black, 0.08)}`,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.06)
      : alpha(theme.palette.common.black, 0.04),
  },
}));

/* ─── Component ─── */

export default function Lobby({
  username, setUsername,
  videoEnabled, setVideoEnabled,
  audioEnabled, setAudioEnabled,
  onJoin, localStream
}) {
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username.trim()) {
      onJoin();
    }
  };

  return (
    <LobbyWrapper>
      {/* Theme toggle */}
      <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'} arrow>
        <ThemeToggle onClick={toggleColorMode} aria-label="Toggle theme">
          {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </ThemeToggle>
      </Tooltip>

      <Fade in timeout={600}>
        <ContentColumn>
          {/* Header */}
          <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'text.primary',
                mb: 1,
              }}
            >
              Set Up Your Meeting Room
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: 360,
                mx: 'auto',
              }}
            >
              Adjust your camera and microphone before joining
            </Typography>
          </Box>

          {/* Camera Preview */}
          <PreviewContainer>
            {videoEnabled && localStream ? (
              <PreviewVideo
                ref={(el) => {
                  if (el && localStream) {
                    el.srcObject = localStream;
                  }
                }}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                }}
              >
                <VideocamOff
                  sx={{
                    fontSize: 48,
                    color: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.15)
                      : alpha(theme.palette.common.black, 0.15),
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    letterSpacing: '0.03em',
                  }}
                >
                  Camera is off / now check
                </Typography>
              </Box>
            )}
          </PreviewContainer>

          {/* Media Controls */}
          <ControlBar>
            <Tooltip title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'} arrow>
              <ControlBtn
                active={audioEnabled ? 'true' : 'false'}
                onClick={() => setAudioEnabled(!audioEnabled)}
                aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {audioEnabled ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
              </ControlBtn>
            </Tooltip>

            <Tooltip title={videoEnabled ? 'Turn off camera' : 'Turn on camera'} arrow>
              <ControlBtn
                active={videoEnabled ? 'true' : 'false'}
                onClick={() => setVideoEnabled(!videoEnabled)}
                aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Videocam fontSize="small" /> : <VideocamOff fontSize="small" />}
              </ControlBtn>
            </Tooltip>

            <Tooltip title="Share screen" arrow>
              <ControlBtn active="true" aria-label="Share screen">
                <ScreenShare fontSize="small" />
              </ControlBtn>
            </Tooltip>
          </ControlBar>

          {/* Name Input + Join */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
            <TextField
              fullWidth
              placeholder="Enter your name"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              InputProps={{
                sx: {
                  borderRadius: 2.5,
                  fontSize: '0.95rem',
                  height: 52,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.03)
                    : alpha(theme.palette.common.black, 0.02),
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.1)
                      : alpha(theme.palette.common.black, 0.1),
                    transition: 'border-color 0.2s ease',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.2)
                      : alpha(theme.palette.common.black, 0.2),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1.5px',
                  },
                },
              }}
              inputProps={{
                'aria-label': 'Your display name',
              }}
            />

            <JoinButton
              variant="contained"
              size="large"
              onClick={onJoin}
              disabled={!username.trim()}
              disableElevation
            >
              Join Meeting
            </JoinButton>
          </Box>

          {/* Connection Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: 0.5,
              transition: 'opacity 0.2s ease',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'success.main',
                boxShadow: `0 0 6px ${alpha(theme.palette.success.main, 0.4)}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                fontFamily: 'monospace',
              }}
            >
              Secure connection ready
            </Typography>
          </Box>
        </ContentColumn>
      </Fade>
    </LobbyWrapper>
  );
}
