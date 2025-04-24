import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "../../components/ui/card";
   import { Button } from "../../components/ui/button";
   import { Input } from "../../components/ui/input";
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
   import { Alert, AlertDescription } from "../../components/ui/alert";
   import { Badge } from "../../components/ui/badge";
   import { Separator } from "../../components/ui/separator";
   import { ScrollArea } from "../../components/ui/scroll-area";
   import { RotateCw, RefreshCw, Play, Square, Plug, Send } from 'lucide-react';

// Базовый URL для Arduino сервера
const ARDUINO_SERVER_URL = 'http://localhost:3001/api';

const CardReaderMonitor = () => {
  const [connected, setConnected] = useState(false);
  const [cardDetected, setCardDetected] = useState(false);
  const [cardId, setCardId] = useState('');
  const [cardType, setCardType] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [manualCardId, setManualCardId] = useState('');
  const [useArduinoServer, setUseArduinoServer] = useState(false);
  
  // Функция для использования правильного API в зависимости от режима
  const getApiUrl = (endpoint) => {
    return useArduinoServer 
      ? `${ARDUINO_SERVER_URL}/${endpoint}` 
      : `/api/card-reader/${endpoint}`;
  };

  // Get initial status
  useEffect(() => {
    checkArduinoServer();
    fetchStatus();
    fetchAvailablePorts();
    
    // Set up polling for status updates
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [useArduinoServer]);

  const checkArduinoServer = async () => {
    try {
      // Пробуем подключиться к Arduino серверу
      const response = await axios.get(`${ARDUINO_SERVER_URL}/status`, { timeout: 1000 });
      setUseArduinoServer(true);
      addEvent('Connected to Arduino Server');
      console.log('Using Arduino Server for card reading');
    } catch (err) {
      // Если сервер недоступен, используем симуляцию
      setUseArduinoServer(false);
      console.log('Arduino Server not available, using simulation');
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(getApiUrl('status'));
      setConnected(response.data.connected);
      setStatus(response.data.status);
      setCardDetected(response.data.cardPresent || false);
      
      if (response.data.cardPresent) {
        setCardId(response.data.cardId || '');
        setCardType(response.data.cardType || '');
      }
    } catch (err) {
      console.error('Error fetching card reader status:', err);
      setError('Failed to fetch card reader status');
    }
  };

  // Add a polling for card reading when connected
  useEffect(() => {
    let cardPollInterval;
    
    if (connected) {
      // Poll for card reading every 1 second
      cardPollInterval = setInterval(async () => {
        try {
          const response = await axios.get(getApiUrl('read-card'));
          
          if (response.data.cardPresent) {
            // Card detected
            setCardDetected(true);
            setCardId(response.data.cardId || '');
            setCardType(response.data.cardType || '');
            
            // Log event
            addEvent(`Card detected: ${response.data.cardId} (${response.data.cardType})`);
          }
        } catch (err) {
          console.error('Error polling for card:', err);
        }
      }, 1000);
    }
    
    return () => {
      if (cardPollInterval) clearInterval(cardPollInterval);
    };
  }, [connected, useArduinoServer]);

  const fetchAvailablePorts = async () => {
    try {
      const response = await axios.get(getApiUrl('ports'));
      setAvailablePorts(response.data);
      
      // If we have a port and none is selected, select the first one
      if (response.data.length > 0 && !selectedPort) {
        setSelectedPort(response.data[0].path);
      }
    } catch (err) {
      console.error('Error fetching available ports:', err);
      setError('Failed to fetch available serial ports');
    }
  };

  const connectToReader = async () => {
    if (!selectedPort) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(getApiUrl('connect'), { port: selectedPort });
      setConnected(response.data.connected);
      setStatus(response.data.status);
      addEvent(`Connected to ${selectedPort}`);
    } catch (err) {
      console.error('Error connecting to card reader:', err);
      setError('Failed to connect to card reader');
      addEvent(`Connection failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromReader = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(getApiUrl('disconnect'));
      setConnected(false);
      setStatus('Disconnected');
      setCardDetected(false);
      addEvent('Disconnected from card reader');
    } catch (err) {
      console.error('Error disconnecting from card reader:', err);
      setError('Failed to disconnect from card reader');
    } finally {
      setLoading(false);
    }
  };

  const resetReader = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(getApiUrl('reset'));
      addEvent('Card reader reset initiated');
      await fetchStatus();
    } catch (err) {
      console.error('Error resetting card reader:', err);
      setError('Failed to reset card reader');
    } finally {
      setLoading(false);
    }
  };

  const simulateScan = async () => {
    if (!manualCardId.trim()) {
      setError('Please enter a card ID to simulate');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(getApiUrl('simulate-scan'), { cardId: manualCardId });
      addEvent(`Simulated scan for card ID: ${manualCardId}`);
      setManualCardId('');
    } catch (err) {
      console.error('Error simulating card scan:', err);
      setError('Failed to simulate card scan');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [{ timestamp, message }, ...prev].slice(0, 20));
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium mb-3">Reader Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode:</span>
                <Badge variant="outline" className="bg-blue-50">
                  {useArduinoServer ? 'Hardware (Arduino Server)' : 'Simulation'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection:</span>
                <Badge variant={connected ? "success" : "destructive"}>
                  {connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm">{status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Card Present:</span>
                <Badge variant={cardDetected ? "success" : "secondary"}>
                  {cardDetected ? 'Yes' : 'No'}
                </Badge>
              </div>
              {cardDetected && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Card ID:</span>
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">{cardId}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Card Type:</span>
                    <span className="text-sm">{cardType}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium mb-3">Port Connection</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Select
                  disabled={connected || loading}
                  value={selectedPort}
                  onValueChange={setSelectedPort}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select a port" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePorts.map((port) => (
                      <SelectItem key={port.path} value={port.path}>
                        {port.path} - {port.manufacturer || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchAvailablePorts}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={connectToReader}
                  disabled={!selectedPort || connected || loading}
                >
                  {loading ? (
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="mr-2 h-4 w-4" />
                  )}
                  Connect
                </Button>
                <Button
                  variant="outline"
                  onClick={disconnectFromReader}
                  disabled={!connected || loading}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
                <Button
                  variant="secondary"
                  onClick={resetReader}
                  disabled={!connected || loading}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Reset Reader
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium mb-3">Simulate Card Scan</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Card ID (HEX) e.g. 1A2B3C4D"
                value={manualCardId}
                onChange={(e) => setManualCardId(e.target.value)}
                disabled={!connected || loading}
              />
              <Button
                onClick={simulateScan}
                disabled={!connected || !manualCardId.trim() || loading}
              >
                <Send className="mr-2 h-4 w-4" />
                Simulate
              </Button>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <h3 className="text-lg font-medium mb-3">Event Log</h3>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events yet
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{event.message}</div>
                    <div className="text-xs text-muted-foreground">{event.timestamp}</div>
                    {index < events.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center">
          <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default CardReaderMonitor; 