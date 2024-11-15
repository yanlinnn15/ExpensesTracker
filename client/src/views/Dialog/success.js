import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

// Success Dialog
export const SuccessDialog = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Successful</DialogTitle>
        <DialogContent>
            <Typography variant="body1">Deleted Successfully!</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">
                Close
            </Button>
        </DialogActions>
    </Dialog>
);