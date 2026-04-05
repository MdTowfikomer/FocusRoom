import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Container, Grid, Paper, TextField, Button,
    IconButton, Stack, Chip, Divider, useMediaQuery, Fade
} from '@mui/material';
import {
    VideoCall, Keyboard, Schedule, History,
    Settings, Logout, DarkMode, LightMode, ArrowForward
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useContext } from 'react';

/* ─── Styled Components ─── */

const DashboardWrapper = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.paper, 0.05),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.08),
        borderColor: alpha(theme.palette.primary.main, 0.3),
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.4)}`,
    },
}));

const NexusTile = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active, color }) => ({
    flex: 1,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(color || theme.palette.primary.main, active ? 0.15 : 0.05),
    border: `1px solid ${alpha(color || theme.palette.primary.main, active ? 0.4 : 0.1)}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: alpha(color || theme.palette.primary.main, 0.2),
        borderColor: alpha(color || theme.palette.primary.main, 0.6),
        '& .tile-icon': {
            transform: 'scale(1.1) rotate(-5deg)',
            color: color || theme.palette.primary.main,
        },
        '& .tile-arrow': {
            transform: 'translateX(4px)',
            opacity: 1,
        }
    },
}));

const TileIconBox = styled(Box)(({ theme, color }) => ({
    width: 56,
    height: 56,
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: alpha(color || theme.palette.primary.main, 0.8),
    transition: 'all 0.3s ease',
}));

const SidePanel = styled(Box)(({ theme }) => ({
    borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    height: '100%',
    padding: theme.spacing(4),
    backgroundColor: alpha(theme.palette.background.paper, 0.02),
    [theme.breakpoints.down('md')]: {
        borderLeft: 'none',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    },
}));

/* ─── Component ─── */

export default function Home() {
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { userData, token, handleLogout } = useContext(AuthContext);

    const [joinCode, setJoinCode] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!token) {
            navigate("/auth");
        }
    }, [token, navigate]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleStartMeeting = () => {
        const randomId = Math.random().toString(36).substring(2, 10);
        navigate(`/${randomId}`);
    };

    const handleJoinMeeting = () => {
        if (joinCode.trim()) {
            navigate(`/${joinCode}`);
        }
    };

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <DashboardWrapper>
            {/* ── Header ── */}
            <Container maxWidth="xl">
                <Box sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h2" sx={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            letterSpacing: '-0.5px',
                            background: theme.palette.mode === 'dark' ?
                                'linear-gradient(135deg, #fff 0%, #60A5FA 100%)' :
                                'linear-gradient(135deg, #2563EB 0%, #a1b2e7ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            font: "'Plus Jakarta Sans', 'Inter', 'sans-serif'",
                            textTransform: "none",
                        }}>
                            FocusRoom
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={toggleColorMode} sx={{ border: 1, borderColor: alpha(theme.palette.divider, 0.1) }}>
                            {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                        </IconButton>
                        <Chip
                            icon={<Settings fontSize="small" />}
                            label="SETTINGS"
                            variant="outlined"
                            onClick={() => { }}
                            sx={{ borderRadius: 1, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}
                        />
                        <IconButton color="error" size="small" onClick={handleLogout}>
                            <Logout fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>
            </Container>

            {/* ── Main Hero ── */}
            <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
                <Grid container spacing={6} alignItems="stretch">

                    <Grid item xs={12} md={8}>
                        <Fade in timeout={800}>
                            <Box>
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 4, mb: 1, display: 'block' }}>
                                    SYSTEM_INITIALIZED // WELCOME_BACK {userData?.username?.toUpperCase()}
                                </Typography>
                                <Typography variant={isMobile ? "h3" : "h1"} sx={{ fontWeight: 800, mb: 2, letterSpacing: -2 }}>
                                    Ready to connect?
                                </Typography>

                                <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 6 }}>
                                    <Typography variant="h4" sx={{ opacity: 0.5, fontWeight: 300 }}>
                                        {formattedDate}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                        {formattedTime}
                                    </Typography>
                                </Stack>

                                {/* ── Quick Action Nexus ── */}
                                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>

                                    <NexusTile color={theme.palette.warning.main} onClick={handleStartMeeting}>
                                        <TileIconBox color={theme.palette.warning.main} className="tile-icon">
                                            <VideoCall sx={{ fontSize: 32 }} />
                                        </TileIconBox>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>New Meeting</Typography>
                                            <Typography variant="body2" color="text.secondary">Create an instant room and invite others</Typography>
                                        </Box>
                                        <ArrowForward className="tile-arrow" sx={{ position: 'absolute', right: 24, bottom: 24, opacity: 0, transition: '0.3s' }} />
                                    </NexusTile>

                                    <NexusTile color={theme.palette.primary.main} active={joinCode.length > 0}>
                                        <TileIconBox color={theme.palette.primary.main} className="tile-icon">
                                            <Keyboard sx={{ fontSize: 32 }} />
                                        </TileIconBox>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Join Session</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Enter room ID..."
                                                    value={joinCode}
                                                    onChange={(e) => setJoinCode(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            bgcolor: alpha(theme.palette.common.black, 0.2),
                                                            fontFamily: 'Space Mono, monospace',
                                                            borderRadius: 1.5
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    disabled={!joinCode.trim()}
                                                    onClick={handleJoinMeeting}
                                                    sx={{ borderRadius: 1.5, px: 3 }}
                                                >
                                                    Join
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </NexusTile>

                                    <NexusTile color={theme.palette.text.secondary}>
                                        <TileIconBox color={theme.palette.text.secondary} className="tile-icon">
                                            <Schedule sx={{ fontSize: 32 }} />
                                        </TileIconBox>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Schedule</Typography>
                                            <Typography variant="body2" color="text.secondary">Plan a future focus session</Typography>
                                        </Box>
                                        <Chip label="SOON" size="small" sx={{ position: 'absolute', top: 16, right: 16, fontSize: '0.6rem', fontWeight: 900 }} />
                                    </NexusTile>

                                </Box>
                            </Box>
                        </Fade>
                    </Grid>

                    {/* ── Side Activity Panel ── */}
                    <Grid item xs={12} md={4}>
                        <Fade in timeout={1200}>
                            <Box sx={{ height: '100%' }}>
                                <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2, mb: 3, display: 'block' }}>
                                        RECENT_SESSIONS
                                    </Typography>

                                    <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
                                        {[1, 2, 3].map((item) => (
                                            <Box
                                                key={item}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: 1,
                                                    borderColor: alpha(theme.palette.divider, 0.1),
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: alpha(theme.palette.primary.main, 0.2) },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>ROOM_X{item}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Last active: 2 hours ago</Typography>
                                                    </Box>
                                                    <History fontSize="small" sx={{ opacity: 0.3 }} />
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>

                                    <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />

                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, border: '1px dashed', borderColor: alpha(theme.palette.success.main, 0.2) }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontFamily: 'Space Mono, monospace' }}>
                                                NETWORK_STATUS: OPTIMAL
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </GlassCard>
                            </Box>
                        </Fade>
                    </Grid>

                </Grid>
            </Container>

            {/* ── Footer Metadata ── */}
            <Box sx={{ py: 4, textAlign: 'center', opacity: 0.3 }}>
                <Typography variant="caption" sx={{ fontFamily: 'Space Mono, monospace', letterSpacing: 2 }}>
                    FOCUS_ROOM_OS_V0.1.0_STABLE
                </Typography>
            </Box>

            <style>
                {`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        `}
            </style>
        </DashboardWrapper>
    );
}
