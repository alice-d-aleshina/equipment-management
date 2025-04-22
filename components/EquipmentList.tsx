import React, { useEffect, useState, ChangeEvent } from 'react';
import type { } from '@mui/material/styles';
import type { } from '@mui/lab/themeAugmentation';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import { Equipment, getEquipment, addEquipment, getRooms, getHardwareTypes } from '../utils/api';

interface NewEquipment {
    inv_key: string;
    hardware_id: number;
    group_id?: number;
    status_id: number;
    owner: string;
    place_id: number;
    specifications?: Record<string, any>;
}

interface EquipmentListProps {
    onScanQR?: () => void;
}

export default function EquipmentList({ onScanQR }: EquipmentListProps) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [rooms, setRooms] = useState<string[]>([]);
    const [hardwareTypes, setHardwareTypes] = useState<string[]>([]);
    const [newEquipment, setNewEquipment] = useState<NewEquipment>({
        inv_key: '',
        hardware_id: 0,
        status_id: 1, // Default to available
        owner: '',
        place_id: 0,
        specifications: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEquipment = async () => {
        try {
            const data = await getEquipment();
            setEquipment(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch equipment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomsAndTypes = async () => {
        try {
            const [roomsData, typesData] = await Promise.all([
                getRooms(),
                getHardwareTypes()
            ]);
            setRooms(roomsData);
            setHardwareTypes(typesData);
        } catch (err) {
            console.error('Failed to fetch rooms and types:', err);
        }
    };

    useEffect(() => {
        fetchEquipment();
        fetchRoomsAndTypes();
    }, []);

    const handleAddEquipment = async () => {
        try {
            await addEquipment(newEquipment);
            setOpenDialog(false);
            setNewEquipment({
                inv_key: '',
                hardware_id: 0,
                status_id: 1,
                owner: '',
                place_id: 0,
                specifications: {}
            });
            await fetchEquipment();
        } catch (err) {
            console.error('Failed to add equipment:', err);
            setError('Failed to add equipment');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'success.main';
            case 'in_use':
                return 'warning.main';
            case 'maintenance':
                return 'error.main';
            default:
                return 'text.primary';
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Equipment
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<QrCodeIcon />}
                        onClick={onScanQR}
                        sx={{ mr: 1 }}
                    >
                        Scan QR
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add Equipment
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {equipment.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.group}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>
                                    <Typography color={getStatusColor(item.status)}>
                                        {item.status}
                                    </Typography>
                                </TableCell>
                                <TableCell>{item.owner || '-'}</TableCell>
                                <TableCell>
                                    <IconButton size="small">
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Inventory Key"
                        fullWidth
                        value={newEquipment.inv_key}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                            setNewEquipment({ ...newEquipment, inv_key: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Hardware Type</InputLabel>
                        <Select
                            value={newEquipment.hardware_id.toString()}
                            label="Hardware Type"
                            onChange={(e: SelectChangeEvent) => 
                                setNewEquipment({ ...newEquipment, hardware_id: parseInt(e.target.value, 10) })}
                        >
                            {hardwareTypes.map((type, index) => (
                                <MenuItem key={type} value={index + 1}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={newEquipment.place_id.toString()}
                            label="Location"
                            onChange={(e: SelectChangeEvent) => 
                                setNewEquipment({ ...newEquipment, place_id: parseInt(e.target.value, 10) })}
                        >
                            {rooms.map((room, index) => (
                                <MenuItem key={room} value={index + 1}>
                                    {room}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Specifications"
                        fullWidth
                        multiline
                        rows={4}
                        value={JSON.stringify(newEquipment.specifications)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                            setNewEquipment({ 
                                ...newEquipment, 
                                specifications: JSON.parse(e.target.value) 
                            })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddEquipment} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 