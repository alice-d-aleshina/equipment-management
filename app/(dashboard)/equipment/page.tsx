"use client"

import { useState } from "react"
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

export default function EquipmentPage() {
  const [readerActive, setReaderActive] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const { equipment, loading: equipmentLoading, checkoutEquipment, returnEquipment } = useEquipment()
  const { students, loading: studentsLoading } = useStudents()
  const { scanCard } = useCardReader({
    onSuccess: (userId) => {
      // Handle successful card scan
    },
  })

  const handleCardScan = (studentId: string) => {
    scanCard(studentId)
  }

  const handleCheckout = (studentId: string, equipmentId: string) => {
    checkoutEquipment(equipmentId, studentId)
  }

  const handleReturn = (equipmentId: string) => {
    returnEquipment(equipmentId)
  }

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isLoading = equipmentLoading || studentsLoading

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Equipment Management</h1>
      
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Equipment Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="reader-active" className="text-sm">Card Reader</Label>
              <Switch
                id="reader-active"
                checked={readerActive}
                onCheckedChange={setReaderActive}
              />
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equipment Inventory</CardTitle>
                  <Input
                    placeholder="Search equipment..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <CardDescription>
                  View and manage all equipment items in the inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <EquipmentList 
                    equipment={filteredEquipment} 
                    students={students}
                    onReturn={handleReturn}
                    onCheckout={handleCheckout}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Card Reader Simulator
                </CardTitle>
                <CardDescription>Simulate student card scanning and equipment checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <CardReaderSimulator
                  students={students}
                  equipment={equipment}
                  onCardScan={handleCardScan}
                  onCheckout={handleCheckout}
                  isActive={readerActive}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 