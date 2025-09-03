import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormaPagamentoFormMUI from './FormaPagamentoFormMUI';

const FormaPagamentoModalForm = ({ open, onClose, onSaveSuccess, formaPagamentoId }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        <FormaPagamentoFormMUI 
          id={formaPagamentoId} 
          isModal={true} 
          onClose={onSaveSuccess || onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormaPagamentoModalForm;