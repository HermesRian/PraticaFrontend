import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClienteForm from './ClienteFormMUI';

const ClienteModalForm = ({ open, onClose, onSaveSuccess, clienteId }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: '1400px',
        }
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0 }}>
        <ClienteForm 
          id={clienteId} 
          isModal={true} 
          onClose={onSaveSuccess || onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModalForm;
