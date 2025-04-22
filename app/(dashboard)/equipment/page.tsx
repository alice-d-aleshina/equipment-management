"use client"

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Package, Scan } from "lucide-react"
import EquipmentList from "@/components/equipment/equipment-list"
import CardReaderSimulator from "@/components/card-reader/card-reader-simulator"
import { useEquipment } from "@/lib/hooks/useEquipment"
import { useStudents } from "@/lib/hooks/useStudents"
import { useCardReader } from "@/lib/hooks/useCardReader"
import { Equipment, Student } from "@/lib/types"

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentData, studentsData] = await Promise.all([
          fetch('/api/equipment').then(res => res.json()),
          fetch('/api/students').then(res => res.json())
        ])
        setEquipment(equipmentData)
        setStudents(studentsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleReturn = async (equipmentId: string) => {
    try {
      // TODO: Implement return API call
      console.log('Return equipment:', equipmentId)
      
      // Оптимистичное обновление UI
      setEquipment(equipment.map(item => 
        item.id === equipmentId 
          ? { ...item, status: 'available' as const, assignedTo: undefined }
          : item
      ))
    } catch (error) {
      console.error('Error returning equipment:', error)
    }
  }

  const handleCheckout = async (studentId: string, equipmentId: string) => {
    try {
      // TODO: Implement checkout API call
      console.log('Checkout equipment:', equipmentId, 'to student:', studentId)
      
      // Оптимистичное обновление UI
      const student = students.find(s => s.id === studentId)
      if (student) {
        setEquipment(equipment.map(item => 
          item.id === equipmentId 
            ? { ...item, status: 'in_use' as const, assignedTo: student.group }
            : item
        ))
      }
    } catch (error) {
      console.error('Error checking out equipment:', error)
    }
  }

  const handleAddEquipment = () => {
    // TODO: Implement add equipment logic
    console.log('Add equipment')
  }

  const handleScanQR = () => {
    // TODO: Implement QR scan logic
    console.log('Scan QR')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление оборудованием</h1>
      </div>
      
      <EquipmentList 
        equipment={equipment}
        students={students}
        onReturn={handleReturn}
        onCheckout={handleCheckout}
        onAddEquipment={handleAddEquipment}
        onScanQR={handleScanQR}
      />
    </div>
  )
} 