import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Container, Paper, TextField, Button,
    IconButton, Stack, Chip, Divider, useMediaQuery, Fade,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer,
    Avatar, InputAdornment
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    VideoCall, Keyboard, Schedule, History,
    Settings, Logout, DarkMode, LightMode, ArrowForward,
    EventNote, Videocam, Search, Menu as MenuIcon, Phone
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useColorMode } from '../contexts/ColorModeContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/* ─── Styled Components ─── */

const DashboardWrapper = styled(Box)(({ theme }) => ({
    height: '100vh',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
}));

const NexusTile = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active, color }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    bgcolor: 'rgba(59,130,246,0.10)',
    border: '1px solid rgba(59,130,246,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    '&:hover': {
        backgroundColor: alpha(color || theme.palette.primary.main, 0.2),
        borderColor: alpha(color || theme.palette.primary.main, 0.6),
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

export default function Home() {
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { userData, token, handleLogout } = useContext(AuthContext);

    const [joinCode, setJoinCode] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('meetings');
    const [drawerOpen, setDrawerOpen] = useState(false);

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
    const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    const SidebarContent = (
        <Box sx={{ width: 240, pt: 2 }}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={activeTab === 'meetings'}
                        onClick={() => { setActiveTab('meetings'); if (isMobile) setDrawerOpen(false); }}
                        sx={{
                            borderRadius: '0 24px 24px 0', mr: 2, mb: 1,
                            bgcolor: activeTab === 'meetings' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            color: activeTab === 'meetings' ? 'primary.main' : 'text.primary'
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            <Videocam />
                        </ListItemIcon>
                        <ListItemText primary="Meetings" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={activeTab === 'calls'}
                        onClick={() => { setActiveTab('calls'); if (isMobile) setDrawerOpen(false); }}
                        sx={{
                            borderRadius: '0 24px 24px 0', mr: 2,
                            bgcolor: activeTab === 'calls' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            color: activeTab === 'calls' ? 'primary.main' : 'text.primary'
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            <Phone />
                        </ListItemIcon>
                        <ListItemText primary="Calls" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    const MeetingsView = () => (
        // <Fade in timeout={600}>
        <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: isMobile ? 4 : 8, pb: 4 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant={isMobile ? "h4" : "h3"} textAlign="center" sx={{ fontWeight: 400, mb: 2 }}>
                    Video calls and meetings for everyone
                </Typography>
                <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ fontWeight: 400, mb: 6 }}>
                    Connect, collaborate and celebrate from anywhere with FocusRoom
                </Typography>

                <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <NexusTile color={theme.palette.primary.main} onClick={handleStartMeeting}>
                            <TileIconBox color={theme.palette.primary.main} className="tile-icon">
                                <VideoCall sx={{ fontSize: 32 }} />
                            </TileIconBox>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>New Meeting</Typography>
                                <Typography variant="body2" color="text.secondary">Create an instant room and invite others</Typography>
                            </Box>
                        </NexusTile>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <NexusTile color={theme.palette.primary.main} active={joinCode.length > 0}>
                            <TileIconBox color={theme.palette.primary.main} className="tile-icon">
                                <Keyboard sx={{ fontSize: 32 }} />
                            </TileIconBox>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Join Session</Typography>
                                <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Enter room ID or link"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                borderRadius: 1.5
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={!joinCode.trim()}
                                        onClick={handleJoinMeeting}
                                        sx={{ borderRadius: 1.5, px: 3, whiteSpace: 'nowrap' }}
                                        color="primary"
                                    >
                                        Join
                                    </Button>
                                </Stack>
                            </Box>
                        </NexusTile>
                    </Grid>
                </Grid>
            </Box>


        </Container>
        // </Fade>
    );

    const CallsView = () => (
        <Container maxWidth="md" sx={{ pt: isMobile ? 2 : 4, pb: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ mb: 4, px: isMobile ? 0 : 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search contacts or dial a number"
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: '24px',
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            '& fieldset': { border: 'none' },
                            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                            transition: 'all 0.2s',
                            '&:focus-within': {
                                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
                                bgcolor: 'background.paper',
                            }
                        }
                    }}
                />
            </Box>

            <Box sx={{ px: isMobile ? 0 : 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2, ml: 1 }}>
                    History
                </Typography>

                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <List disablePadding>
                        {[1, 2, 3].map((item, index) => (
                            <React.Fragment key={item}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ListItemIcon>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                            RM
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={`ROOM_X${item}`}
                                        slotProps={{ primary: { sx: { fontWeight: 500, fontFamily: 'Space Mono, monospace' } } }}
                                        secondary={<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <History sx={{ fontSize: 14 }} color="action" />
                                            <span>Session • 2 hours ago</span>
                                        </Box>}
                                    />
                                    <IconButton size="small" edge="end">
                                        <Phone fontSize="small" />
                                    </IconButton>
                                </ListItem>
                                {index < 2 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Container>
    );

    return (
        <DashboardWrapper>
            {/* ── Header ── */}
            <Box sx={{
                px: { xs: 2, md: 3 },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {isMobile && (
                        <IconButton onClick={() => setDrawerOpen(true)} edge="start" color="inherit">
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h5" sx={{
                        fontWeight: 800,
                        letterSpacing: '-0.5px',
                        background: theme.palette.mode === 'dark' ?
                            'linear-gradient(135deg, #fff 0%, #60A5FA 100%)' :
                            'linear-gradient(135deg, #2563EB 0%, #a1b2e7ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        font: "'Plus Jakarta Sans', 'Inter', 'sans-serif'",
                    }}>
                        FocusRoom
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
                        {formattedTime} • {formattedDate}
                    </Typography>

                    <IconButton size={isMobile ? "small" : "medium"} onClick={toggleColorMode}>
                        {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                    </IconButton>
                    <IconButton size={isMobile ? "small" : "medium"} onClick={() => { }}>
                        <Settings fontSize="small" />
                    </IconButton>
                    <Avatar
                        sx={{
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                            bgcolor: theme.palette.secondary.main,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            ml: 1
                        }}
                        onClick={handleLogout}
                    >
                        {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                </Stack>
            </Box>

            {/* ── Main Layout Area ── */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* ── Sidebar (Desktop) ── */}
                {!isMobile && (
                    <Box sx={{ borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`, flexShrink: 0 }}>
                        {SidebarContent}
                    </Box>
                )}

                {/* ── Sidebar (Mobile Temporary Drawer) ── */}
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    slotProps={{ paper: { sx: { width: 280, bgcolor: 'background.default' } } }}
                >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>FocusRoom</Typography>
                    </Box>
                    {SidebarContent}
                </Drawer>

                {/* ── Content View ── */}
                <Box sx={{ flex: 1 }}>
                    {activeTab === 'meetings' ? MeetingsView() : CallsView()}
                </Box>
            </Box>
        </DashboardWrapper>
    );
}
