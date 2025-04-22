"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, RotateCcw, Package2, Filter, Search, ArrowDownToLine, ArrowUpFromLine, Package, Users, Plus, Scan, CheckCircle2, Clock } from "lucide-react"
import type { Equipment, Student } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
  const [showMobileView, setShowMobileView] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'checked-out'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("equipment");
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  // Обработчик изменения размера окна для отзывчивого UI
  useEffect(() => {
    // Инициализация состояния при монтировании компонента
    setShowMobileView(window.innerWidth < 768);
    
    const handleResize = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    // Очистка обработчика при размонтировании компонента
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get student name by ID
  const getStudentName = (studentId: string | null | undefined): string => {
    if (!studentId) return "Неизвестно";
    const student = students.find((s) => s.id === studentId);
    return student ? student.name : "Неизвестно";
  };

  // Handle equipment checkout/return
  const handleEquipmentToggle = (item: Equipment) => {
    if (item.status === "checked-out") {
      onReturn(item.id);
    } else if (onCheckout && selectedStudentId) {
      onCheckout(selectedStudentId, item.id);
      setSelectedStudentId("");
    }
  };

  // Filter equipment by status and search query
  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.group.toLowerCase().includes(searchLower) ||
      item.owner.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />;
      case "checked-out":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Доступно";
      case "checked-out":
        return "Выдано";
      default:
        return "Неизвестно";
    }
  };

  // Mobile view
  if (showMobileView) {
    return (
      <div className="bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className="flex-1"
            >
              Все
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === 'available' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('available')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Доступно
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === 'checked-out' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('checked-out')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Выдано
            </Button>
          </div>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Оборудование не найдено</h3>
            <p className="mt-1 text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEquipment.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Package2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <Badge className={`${
                        item.status === "available" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === "available" ? "Доступно" : "Выдано"}
                      </Badge>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-500">
                      <p>ID: {item.id}</p>
                      <p>Группа: {item.group}</p>
                      <p>Место: {item.location}</p>
                    </div>
                    
                    {item.status === "checked-out" && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-md text-sm">
                        <p className="flex justify-between text-amber-800">
                          <span className="font-medium">Выдано:</span> 
                          <span>{getStudentName(item.checkedOutBy)}</span>
                        </p>
                        <p className="flex justify-between text-amber-800">
                          <span className="font-medium">Время:</span> 
                          <span>{item.checkedOutAt ? formatDate(item.checkedOutAt) : "N/A"}</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      {item.status === "available" ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Доступно для выдачи
                          </Badge>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => onReturn(item.id)}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          <ArrowUpFromLine className="h-4 w-4 mr-1" />
                          Вернуть
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-[300px]">
            <Input
              placeholder="Поиск по названию, месту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white border-gray-200"
            />
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className="px-3"
            >
              Все
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === 'available' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('available')}
              className={`px-3 ${filterStatus === 'available' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Доступно
            </Button>
            <Button 
              size="sm" 
              variant={filterStatus === 'checked-out' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('checked-out')}
              className={`px-3 ${filterStatus === 'checked-out' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Выдано
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onScanQR}
          >
            <Scan className="h-4 w-4 mr-2" />
            Сканировать QR
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={onAddEquipment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить оборудование
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Группа</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.group}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}
                  >
                    {getStatusIcon(item.status)}
                    {getStatusText(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.status === "available" ? (
                      <>
                        <Select
                          value={selectedStudent || ""}
                          onValueChange={setSelectedStudent}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Выберите студента" />
                          </SelectTrigger>
                          <SelectContent>
                            {students
                              .filter((s) => s.hasAccess)
                              .map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {selectedStudent && (
                          <Button
                            size="sm"
                            onClick={() => {
                              onCheckout(selectedStudent, item.id);
                              setSelectedStudent(null);
                            }}
                          >
                            Выдать
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReturn(item.id)}
                      >
                        Вернуть
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

