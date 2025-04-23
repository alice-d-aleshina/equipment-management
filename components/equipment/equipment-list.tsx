"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RotateCcw, Package2, Filter, Search, ArrowDownToLine, ArrowUpFromLine, Package, Users, Plus, Scan, CheckCircle2, Clock, AlertTriangle, Wrench } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
  const [isMobile, setIsMobile] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in_use' | 'maintenance' | 'broken'>('all');
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [openSelectIds, setOpenSelectIds] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Функция для программного фокуса на поле поиска
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
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

  // Mobile card view for equipment
  const EquipmentCards = () => (
    <div className="grid grid-cols-1 gap-4">
      {filteredEquipment.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-start">
              <div>
                <div>{item.name}</div>
                <div className="text-sm text-gray-500">{item.nameEn}</div>
              </div>
              <Badge className={getStatusColor(item.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(item.status)}
                  {getStatusText(item.status)}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Тип:</div>
              <div>{item.type}</div>
              <div className="text-gray-500">Владелец:</div>
              <div>{getStudentName(item.checkedOutBy)}</div>
              <div className="text-gray-500">Место:</div>
              <div>{item.location}</div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-col">
            {item.status === 'available' ? (
              <div className="flex flex-col w-full gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedStudents[item.id] 
                        ? getStudentName(selectedStudents[item.id]) 
                        : "Выберите студента"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <div className="p-2">
                      <Input
                        type="text"
                        placeholder="Поиск..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {students
                        .filter(student => 
                          student.hasAccess && 
                          (studentSearchQuery === "" || 
                            student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                            student.group.toLowerCase().includes(studentSearchQuery.toLowerCase())
                          )
                        )
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              handleStudentSelect(item.id, student.id);
                              setStudentSearchQuery('');
                              document.body.click(); // Закрыть попап
                            }}
                          >
                            {student.name} ({student.group})
                          </div>
                        ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedStudents[item.id] && (
                  <Button onClick={() => handleConfirmCheckout(item.id)} className="bg-green-500 hover:bg-green-600 w-full">
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Выдать
                  </Button>
                )}
              </div>
            ) : (item.status === 'in_use' || item.status === 'checked-out') ? (
              <Button onClick={() => onReturn(item.id)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Вернуть
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full">
                {item.status === 'maintenance' ? 'На обслуживании' : 'Недоступно'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Select 
            value={filterStatus} 
            onValueChange={(value: 'all' | 'available' | 'in_use' | 'maintenance' | 'broken') => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
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
          
          <div className="relative w-full md:w-auto">
            <Input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-2 w-full md:w-[250px]"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onScanQR && (
            <Button onClick={onScanQR} variant="outline" className="w-full md:w-auto">
              <Scan className="h-4 w-4 mr-2" />
              Сканировать QR
            </Button>
          )}
          {onAddEquipment && (
            <Button onClick={onAddEquipment} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Добавить оборудование
            </Button>
          )}
        </div>
      </div>

      {isMobile ? (
        <EquipmentCards />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-start">
                              {selectedStudents[item.id] 
                                ? getStudentName(selectedStudents[item.id]) 
                                : "Выберите студента"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <div className="p-2">
                              <Input
                                type="text"
                                placeholder="Поиск..."
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                className="mb-2"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-[200px] overflow-y-auto">
                              {students
                                .filter(student => 
                                  student.hasAccess && 
                                  (studentSearchQuery === "" || 
                                    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                    student.group.toLowerCase().includes(studentSearchQuery.toLowerCase())
                                  )
                                )
                                .map((student) => (
                                  <div
                                    key={student.id}
                                    className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      handleStudentSelect(item.id, student.id);
                                      setStudentSearchQuery('');
                                      document.body.click(); // Закрыть попап
                                    }}
                                  >
                                    {student.name} ({student.group})
                                  </div>
                                ))}
                            </div>
                          </PopoverContent>
                        </Popover>
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
      )}
    </div>
  );
}

