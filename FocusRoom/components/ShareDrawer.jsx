import React, { useState } from 'react';
import { 
    Box, Drawer, Typography, IconButton, TextField, Paper, 
    alpha, useTheme 
} from '@mui/material';
import { Close, ContentCopy, CheckCircle } from '@mui/icons-material';
import { useMeeting } from '../contexts/MeetingContext';

export default function ShareDrawer() {
    const theme = useTheme();
    const { showShare, setShowShare } = useMeeting();
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Drawer
            anchor="bottom"
            open={showShare}
            onClose={() => setShowShare(false)}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: theme.shape.borderRadius * 3,
                    borderTopRightRadius: theme.shape.borderRadius * 3,
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    maxWidth: 600,
                    mx: 'auto',
                    width: '100%',
                    p: 3,
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                        Share Session
                    </Typography>
                    <IconButton onClick={() => setShowShare(false)} size="small" sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                    Anyone with this link can join the meeting.
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        value={window.location.href}
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            readOnly: true,
                            sx: { fontSize: '0.85rem', color: 'text.primary', ml: 1, fontFamily: 'Space Mono, monospace' }
                        }}
                    />
                    <IconButton
                        color={copied ? "success" : "primary"}
                        onClick={handleCopyLink}
                        sx={{ flexShrink: 0 }}
                    >
                        {copied ? <CheckCircle /> : <ContentCopy />}
                    </IconButton>
                </Paper>
            </Box>
        </Drawer>
    );
}
