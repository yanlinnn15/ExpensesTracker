import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('App error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
                    <Typography variant="h5">Something went wrong.</Typography>
                    <Typography variant="body2" color="textSecondary">Please refresh the page to try again.</Typography>
                    <Button variant="contained" onClick={() => window.location.reload()}>Refresh</Button>
                </Box>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
