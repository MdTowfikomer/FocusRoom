import React, { useState } from 'react';
import { 
    Box, Drawer, Divider, Typography, IconButton, TextField, Paper, 
    alpha, useTheme 
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useMeeting } from '../contexts/MeetingContext';

const StyledDrawer = styled(Drawer, {
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

export default function ChatDrawer({ isMobile, username }) {
    const theme = useTheme();
    const { showChat, setShowChat, messages, sendMessage } = useMeeting();
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(username, message);
            setMessage("");
        }
    };

    return (
        <StyledDrawer
            anchor={isMobile ? "bottom" : "right"}
            open={showChat}
            onClose={() => setShowChat(false)}
            variant={isMobile ? "temporary" : "persistent"}
            isMobile={isMobile}
            sx={{ '& .MuiDrawer-paper': { height: isMobile ? '100dvh' : '100%' } }}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' } }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!message.trim()} sx={{ border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                    <Send fontSize="small" />
                </IconButton>
            </Box>
        </StyledDrawer>
    );
}
