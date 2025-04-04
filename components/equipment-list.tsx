"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { Equipment, Student } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface EquipmentListProps {
  equipment: Equipment[]
  students: Student[]
  onReturn: (equipmentId: string) => void
}

export default function EquipmentList({ equipment, students, onReturn }: EquipmentListProps) {
  const getStudentName = (studentId: string | null) => {
    if (!studentId) return "N/A"
    const student = students.find((s) => s.id === studentId)
    return student ? student.name : "Unknown"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Студент</TableHead>
            <TableHead>Время выдачи</TableHead>
            <TableHead>Действия</TableHead>
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
                  <Badge>
                    {item.status === "available" ? (
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3 text-amber-500" />
                    )}
                    {item.status === "available" ? "Доступно" : "Недоступно"}
                  </Badge>
                </TableCell>
                <TableCell>{getStudentName(item.checkedOutBy)}</TableCell>
                <TableCell>{item.checkedOutAt ? formatDate(item.checkedOutAt) : "N/A"}</TableCell>
                <TableCell>
                  {item.status === "checked-out" && (
                    <Button onClick={() => onReturn(item.id)}>
                      Вернуть
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

