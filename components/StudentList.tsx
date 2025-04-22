import React, { useEffect, useState } from 'react';
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
    Box
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Student, getStudents, addStudent } from '../utils/api';

export default function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        phone: '',
        card_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = async () => {
        try {
            await addStudent(newStudent);
            setOpenDialog(false);
            setNewStudent({ name: '', email: '', phone: '', card_id: '' });
            await fetchStudents();
        } catch (err) {
            console.error('Failed to add student:', err);
            setError('Failed to add student');
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Students
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Student
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Card ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Access</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell>{student.card_id}</TableCell>
                                <TableCell>
                                    {student.active ? 'Active' : 'Inactive'}
                                </TableCell>
                                <TableCell>
                                    {student.hasAccess ? 'Granted' : 'No Access'}
                                </TableCell>
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
                <DialogTitle>Add New Student</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Phone"
                        fullWidth
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Card ID"
                        fullWidth
                        value={newStudent.card_id}
                        onChange={(e) => setNewStudent({ ...newStudent, card_id: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddStudent} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 