import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import TransportadoraFormMUI from './TransportadoraFormMUI';

const TransportadoraModalForm = ({ open, onClose, transportadoraId = null, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleFormClose = () => {
    if (onSave) {
      onSave(); // Callback para atualizar a lista pai
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        {transportadoraId ? 'Editar Transportadora' : 'Nova Transportadora'}
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <TransportadoraFormMUI
            id={transportadoraId}
            isModal={true}
            onClose={handleFormClose}
            onSubmitStart={() => setIsSubmitting(true)}
            onSubmitEnd={() => setIsSubmitting(false)}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransportadoraModalForm;