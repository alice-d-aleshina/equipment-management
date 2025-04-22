"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RotateCcw, Package2, Filter, Search, ArrowDownToLine, ArrowUpFromLine, Package, Users, Plus, Scan, CheckCircle2, Clock, AlertTriangle, Wrench } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Equipment {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'checked-out';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  assignedTo?: string;
  qrCode: string;
  checkedOutBy: string | null;
  checkedOutAt: Date | null;
}

interface Student {
  id: string;
  name: string;
  group: string;
  hasAccess: boolean;
  email?: string;
  phone?: string;
}

interface EquipmentListProps {
  equipment: Equipment[]
  students: Student[]
  onReturn: (equipmentId: string) => void
  onCheckout: (studentId: string, equipmentId: string) => void
  onAddEquipment?: () => void
  onScanQR?: () => void
}

export default function EquipmentList({ 
  equipment, 
  students, 
  onReturn, 
  onCheckout,
  onAddEquipment,
  onScanQR
}: EquipmentListProps) {
  const [isClient, setIsClient] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in_use' | 'maintenance' | 'broken'>('all');
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredEquipment = equipment.filter(item => {
    return filterStatus === 'all' || item.status === filterStatus;
  });

  const handleStudentSelect = (equipmentId: string, studentId: string) => {
    setSelectedStudents(prev => ({
      ...prev,
      [equipmentId]: studentId
    }));
  };

  const handleConfirmCheckout = (equipmentId: string) => {
    const studentId = selectedStudents[equipmentId];
    if (studentId) {
      onCheckout(studentId, equipmentId);
      setSelectedStudents(prev => {
        const newState = { ...prev };
        delete newState[equipmentId];
        return newState;
      });
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "in_use":
      case "checked-out":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "broken":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Equipment['status']) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_use":
      case "checked-out":
        return <Users className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "broken":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Equipment['status']) => {
    switch (status) {
      case "available":
        return "Доступно";
      case "in_use":
      case "checked-out":
        return "Используется";
      case "maintenance":
        return "На обслуживании";
      case "broken":
        return "Сломано";
      default:
        return status;
    }
  };

  const getStudentName = (studentId: string | null) => {
    if (!studentId) return '—';
    const student = students.find(s => s.id === studentId);
    return student ? `${student.name} (${student.group})` : '—';
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select 
            value={filterStatus} 
            onValueChange={(value: 'all' | 'available' | 'in_use' | 'maintenance' | 'broken') => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="available">Доступно</SelectItem>
              <SelectItem value="in_use">Используется</SelectItem>
              <SelectItem value="maintenance">На обслуживании</SelectItem>
              <SelectItem value="broken">Сломано</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {onScanQR && (
            <Button onClick={onScanQR} variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Сканировать QR
            </Button>
          )}
          {onAddEquipment && (
            <Button onClick={onAddEquipment}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить оборудование
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>{item.name}</div>
                  <div className="text-sm text-gray-500">{item.nameEn}</div>
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{getStudentName(item.checkedOutBy)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {getStatusText(item.status)}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.status === 'available' ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedStudents[item.id] || ""} 
                        onValueChange={(value) => handleStudentSelect(item.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Выберите студента" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem 
                              key={student.id} 
                              value={student.id}
                              disabled={!student.hasAccess}
                            >
                              {student.name} ({student.group}) {!student.hasAccess && '- Нет доступа'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStudents[item.id] && (
                        <Button onClick={() => handleConfirmCheckout(item.id)} size="sm" className="bg-green-500 hover:bg-green-600">
                          <ArrowUpFromLine className="h-4 w-4 mr-2" />
                          Выдать
                        </Button>
                      )}
                    </div>
                  ) : (item.status === 'in_use' || item.status === 'checked-out') ? (
                    <Button onClick={() => onReturn(item.id)} variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Вернуть
                    </Button>
                  ) : (
                    <Button disabled variant="outline" size="sm">
                      {item.status === 'maintenance' ? 'На обслуживании' : 'Недоступно'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

