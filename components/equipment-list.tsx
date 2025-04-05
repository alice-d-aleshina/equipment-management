"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, RotateCcw, Package2 } from "lucide-react"
import type { Equipment, Student } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"

interface EquipmentListProps {
  equipment: Equipment[]
  students: Student[]
  onReturn: (equipmentId: string) => void
  onCheckout?: (equipmentId: string, studentId: string) => void
}

export default function EquipmentList({ equipment, students, onReturn, onCheckout }: EquipmentListProps) {
  const [showMobileView, setShowMobileView] = useState(window.innerWidth < 768);

  // Обработчик изменения размера окна для отзывчивого UI
  useEffect(() => {
    const handleResize = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Очистка обработчика при размонтировании компонента
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStudentName = (studentId: string | null | undefined) => {
    if (!studentId) return "N/A"
    const student = students.find((s) => s.id === studentId)
    return student ? student.name : "Unknown"
  }

  const handleEquipmentToggle = (item: Equipment) => {
    if (item.status === "checked-out") {
      onReturn(item.id);
    } else if (onCheckout && students.length > 0) {
      // Здесь можно было бы добавить модальное окно для выбора студента
      // Но для простоты выбираем первого студента с доступом
      const availableStudent = students.find(s => s.hasAccess);
      if (availableStudent) {
        onCheckout(item.id, availableStudent.id);
      }
    }
  };

  // Мобильный вид для маленьких экранов
  if (showMobileView) {
    return (
      <div className="space-y-4">
        {equipment.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
            Оборудование не найдено
          </div>
        ) : (
          equipment.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Package2 className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                  </div>
                  <Badge className={`
                    ${item.status === "available" 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                    } flex items-center
                  `}>
                    {item.status === "available" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {item.status === "available" ? "Доступно" : "Выдано"}
                  </Badge>
                </div>
                
                {item.status === "checked-out" && (
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p className="flex justify-between">
                      <span className="font-medium">Выдано студенту:</span> 
                      <span>{getStudentName(item.checkedOutBy)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Время выдачи:</span> 
                      <span>{item.checkedOutAt ? formatDate(item.checkedOutAt) : "N/A"}</span>
                    </p>
                  </div>
                )}
                
                {item.group && (
                  <div className="mt-2 text-xs text-gray-500">
                    Группа: {item.group}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Статус выдачи
                </span>
                <div className="flex items-center">
                  <Switch
                    checked={item.status === "checked-out"}
                    onCheckedChange={() => handleEquipmentToggle(item)}
                    className={`${item.status === "checked-out" ? 'bg-amber-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full`}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {item.status === "checked-out" ? "Выдано" : "Не выдано"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Десктопный вид для больших экранов
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Студент</TableHead>
            <TableHead>Время выдачи</TableHead>
            <TableHead>Статус выдачи</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Оборудование не найдено
              </TableCell>
            </TableRow>
          ) : (
            equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge className={`
                    ${item.status === "available" 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                    } flex items-center
                  `}>
                    {item.status === "available" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {item.status === "available" ? "Доступно" : "Выдано"}
                  </Badge>
                </TableCell>
                <TableCell>{getStudentName(item.checkedOutBy)}</TableCell>
                <TableCell>{item.checkedOutAt ? formatDate(item.checkedOutAt) : "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Switch
                      checked={item.status === "checked-out"}
                      onCheckedChange={() => handleEquipmentToggle(item)}
                      className={`${item.status === "checked-out" ? 'bg-amber-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full`}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {item.status === "checked-out" ? "Выдано" : "Не выдано"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

