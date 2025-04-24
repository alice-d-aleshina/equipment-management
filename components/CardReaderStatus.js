import React, { useState, useEffect } from 'react';
import { Box, Typography, Badge, Chip, Paper, Button, CircularProgress } from '@mui/material';
import { green, red, blue, grey } from '@mui/material/colors';
import KeyIcon from '@mui/icons-material/Key';
import UsbIcon from '@mui/icons-material/Usb';
import ReplayIcon from '@mui/icons-material/Replay';

/**
 * CardReaderStatus - A component that displays the current status of the RFID card reader
 * and allows basic interaction with it.
 */
const CardReaderStatus = ({ onCardScanned }) => {
  const [status, setStatus] = useState('disconnected'); // connected, disconnected, error
  const [lastCard, setLastCard] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState([]);

  // Fetch available ports and reader status on component mount
  useEffect(() => {
    fetchPorts();
    fetchStatus();
    
    // Set up interval to periodically check status
    const statusInterval = setInterval(fetchStatus, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(statusInterval);
  }, []);

  // Fetch available serial ports
  const fetchPorts = async () => {
    try {
      const response = await fetch('/api/card-reader/ports');
      if (response.ok) {
        const data = await response.json();
        setPorts(data.ports || []);
      }
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };

  // Fetch current reader status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/card-reader/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connected ? 'connected' : 'disconnected');
        setMessage(data.message || '');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Connection error');
      console.error('Error fetching status:', error);
    }
  };

  // Connect to a specific port
  const connectPort = async (port) => {
    setLoading(true);
    try {
      const response = await fetch('/api/card-reader/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: port.path }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connected ? 'connected' : 'disconnected');
        setMessage(data.message || '');
      } else {
        setStatus('error');
        setMessage('Failed to connect');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Connection error');
      console.error('Error connecting:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reconnect to the card reader
  const handleReconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/card-reader/reconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connected ? 'connected' : 'disconnected');
        setMessage(data.message || '');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Reconnection error');
      console.error('Error reconnecting:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate a card scan (for testing purposes)
  const simulateCardScan = async () => {
    const mockCardId = 'SIMULATED' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    try {
      const response = await fetch('/api/card-reader/simulate-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card_id: mockCardId }),
      });
      
      if (response.ok) {
        setLastCard({
          id: mockCardId,
          timestamp: new Date().toISOString()
        });
        
        // Call the onCardScanned callback if provided
        if (onCardScanned) {
          onCardScanned({
            id: mockCardId,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error simulating scan:', error);
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return green[500];
      case 'disconnected':
        return grey[500];
      case 'error':
        return red[500];
      default:
        return blue[500];
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Card Reader Status
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: getStatusColor(),
                border: '1px solid white',
              }}
            />
          }
        >
          <UsbIcon fontSize="large" />
        </Badge>
        <Box sx={{ ml: 2 }}>
          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
            {status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
        
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <ReplayIcon />}
            onClick={handleReconnect}
            disabled={loading}
          >
            Reconnect
          </Button>
        </Box>
      </Box>
      
      {lastCard && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: blue[50], borderRadius: 1 }}>
          <KeyIcon color="primary" />
          <Box sx={{ ml: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Last card: {lastCard.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(lastCard.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      )}
      
      {ports.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Available ports:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ports.map((port) => (
              <Chip
                key={port.path}
                label={port.path}
                size="small"
                onClick={() => connectPort(port)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      <Box sx={{ mt: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          color="secondary"
          onClick={simulateCardScan}
        >
          Simulate Card Scan
        </Button>
      </Box>
    </Paper>
  );
};

export default CardReaderStatus; 