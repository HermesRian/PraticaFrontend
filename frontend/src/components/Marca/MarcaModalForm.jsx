import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MarcaFormMUI from './MarcaFormMUI';

const MarcaModalForm = ({ id, open = false, onClose }) => {
  if (!open) return null;
  
  return (
    <Dialog 
      open={open}
      onClose={() => onClose()}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: '800px',
        }
      }}
    >
      <IconButton
        aria-label="close"
        onClick={() => onClose()}
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
        <MarcaFormMUI 
          id={id} 
          isModal={true} 
          onClose={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default MarcaModalForm;
