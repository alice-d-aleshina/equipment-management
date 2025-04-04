"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Package, Scan, CheckCircle } from "lucide-react"
import type { Equipment, Student } from "@/lib/types"

interface CardReaderSimulatorProps {
  students: Student[]
  equipment: Equipment[]
  onCardScan: (studentId: string) => void
  onCheckout: (studentId: string, equipmentId: string) => void
  isActive: boolean
}

export default function CardReaderSimulator({
  students,
  equipment,
  onCardScan,
  onCheckout,
  isActive,
}: CardReaderSimulatorProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleCardScan = () => {
    if (!selectedStudent) return

    onCardScan(selectedStudent)

    const student = students.find((s) => s.id === selectedStudent)
    setIsAuthenticated(student?.hasAccess || false)
  }

  const handleCheckout = () => {
    if (!selectedStudent || !selectedEquipment) return
    onCheckout(selectedStudent, selectedEquipment)
    setIsAuthenticated(false)
    setSelectedStudent("")
    setSelectedEquipment("")
  }

  const availableEquipment = equipment.filter((e) => e.status === "available")

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="student-card">Студенческая карта</Label>
          <div className="flex gap-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!isActive}>
              <SelectTrigger id="student-card" className="flex-1">
                <SelectValue placeholder="Выбрать студента" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCardScan} disabled={!selectedStudent || !isActive}>
              <Scan className="h-4 w-4 mr-2" />
              Отсканиировать карту
            </Button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-5">
            <div className="rounded-lg bg-green-50 p-3 text-green-700 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Успешная авторизация
            </div>

            <Label htmlFor="equipment">Выбрать оборудование</Label>
            <div className="flex gap-2">
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment} disabled={!isActive}>
                <SelectTrigger id="equipment" className="flex-1">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {availableEquipment.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Нет возможного оборудования
                    </SelectItem>
                  ) : (
                    availableEquipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleCheckout} disabled={!selectedEquipment || !isActive}>
                <Package className="h-4 w-4 mr-2" />
                Заброировать
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-muted p-4">
          <h3 className="text-sm font-medium mb-2">Стаус считывателя</h3>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm">{isActive ? "Активно" : "Неактивно"}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isActive ? "The card reader is ready to scan student cards" : "The card reader is currently disabled"}
          </p>
        </div>
      </div>
    </div>
  )
}

