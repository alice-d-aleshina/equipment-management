"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Database, Package, Users, Scan } from "lucide-react"
import EquipmentList from "@/components/equipment/equipment-list"
import StudentsList from "@/components/students/students-list"
import NotificationPanel from "@/components/notifications/notification-panel"
import CardReaderSimulator from "@/components/card-reader/card-reader-simulator"
import { Scanner } from '@yudiel/react-qr-scanner'
import type { Equipment, Student, Notification, Building, Lab, Room } from "@/lib/types"
import { initialEquipment, initialStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { NotificationProvider } from "@/lib/context/NotificationContext"

const SlidingPanel = ({ data, onClose, children }: { data: any; onClose: () => void; children?: React.ReactNode }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Информация об оборудовании</h2>
        {children}
        <button type="button" onClick={onClose} className="mt-4 bg-blue-500 text-white p-2 rounded">
          Закрыть
        </button>
      </div>
    </div>
  );
};

// Отдельная панель добавления оборудования
const AddEquipmentPanel = ({ onClose, onSubmit, newEquipment, handleInputChange, buildings, labs, rooms }: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newEquipment: Equipment;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  buildings: Building[];
  labs: Lab[];
  rooms: Room[];
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Добавить новое оборудование</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-4">Заполните данные для добавления нового оборудования</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название оборудования</label>
            <Input
              name="name"
              
              value={newEquipment.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
            <Input
              name="group"
              placeholder="Например: Лабораторное оборудование"
              value={newEquipment.group}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Владелец</label>
            <Input
              name="owner"
              placeholder="Например: Физический факультет"
              value={newEquipment.owner}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
            <Input
              name="location"
              placeholder="Например: Шкаф №5"
              value={newEquipment.location}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комната</label>
            <select
              name="room"
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите комнату</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Здание</label>
            <select
              name="building"
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите здание</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Лаборатория</label>
            <select
              name="lab"
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите лабораторию</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="mt-2 bg-green-500 hover:bg-green-600 text-white">
            Добавить оборудование
          </Button>
        </form>
      </div>
    </div>
  );
};

export default function EquipmentDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [readerActive, setReaderActive] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [scannedData, setScannedData] = useState<{
    name: string;
    key: string;
    equipment: string;
    group: string;
    status: string;
    owner: string;
    location: string;
    available: boolean;
  } | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    id: "",
    name: "",
    status: "available",
    checkedOutBy: null,
    checkedOutAt: null,
    group: "",
    owner: "",
    location: "",
    room: 0,
    building: 0,
    lab: 0,
  });
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("equipment");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingsResponse = await fetch('/api/buildings'); // Adjust the endpoint as necessary
        const labsResponse = await fetch('/api/labs'); // Adjust the endpoint as necessary
        const roomsResponse = await fetch('/api/rooms'); // Adjust the endpoint as necessary

        const buildingsData = await buildingsResponse.json();
        const labsData = await labsResponse.json();
        const roomsData = await roomsResponse.json();

        setBuildings(buildingsData);
        setLabs(labsData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Add a notification
  const addNotification = (message: string, type: "success" | "error" | "info") => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  // Handle equipment checkout
  const handleEquipmentCheckout = (studentId: string, equipmentId: string) => {
    const student = students.find((s) => s.id === studentId)
    const item = equipment.find((e) => e.id === equipmentId)

    if (!student || !item) {
      addNotification("Студент или оборудоваание не найдено", "error")
      return
    }

    if (!student.hasAccess) {
      addNotification(`Доступ заапрещен ${student.name}`, "error")
      return
    }

    if (item.status === "checked-out") {
      addNotification(`${item.name} уже выдано`, "error")
      return
    }

    // Update equipment status
    setEquipment(
      equipment.map((e) =>
        e.id === equipmentId ? { ...e, status: "checked-out", checkedOutBy: studentId, checkedOutAt: new Date() } : e,
      ),
    )

    addNotification(`${student.name} выдано ${item.name}`, "success")
  }

  // Handle equipment return
  const handleEquipmentReturn = (equipmentId: string) => {
    const item = equipment.find((e) => e.id === equipmentId)

    if (!item) {
      addNotification("Оборудование не найдено", "error")
      return
    }

    if (item.status !== "checked-out") {
      addNotification(`${item.name} не выдано`, "error")
      return
    }

    const student = students.find((s) => s.id === item.checkedOutBy)

    // Update equipment status
    setEquipment(
      equipment.map((e) =>
        e.id === equipmentId ? { ...e, status: "available", checkedOutBy: null, checkedOutAt: null } : e,
      ),
    )

    addNotification(`${student?.name || "Студент"} вернул ${item.name}`, "success")
  }

  // Toggle student access
  const toggleStudentAccess = (studentId: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, hasAccess: !s.hasAccess } : s)))

    const student = students.find((s) => s.id === studentId)
    if (student) {
      addNotification(`Доступ ${!student.hasAccess ? "выдан для" : "запрещен для"} ${student.name}`, "info")
    }
  }

  // Simulate card reader detection
  const handleCardScan = (studentId: string) => {
    if (!readerActive) {
      addNotification("Считыватель недоступен", "error")
      return
    }

    const student = students.find((s) => s.id === studentId)

    if (!student) {
      addNotification("Неизвестная карта", "error")
      return
    }

    if (!student.hasAccess) {
      addNotification(`Доступ для ${student.name} запрещен`, "error")
      return
    }

    addNotification(`${student.name} успешная авторизция`, "success")
  }

  const handleScanNFC = () => {
    setScanning(true)
  }

  const handleScan = (data: any) => {
    if (data) {
      console.log("Scanned data:", data);
      const scannedEquipmentId = data.rawValue; // Assuming this is the key
      const scannedItem = equipment.find(item => item.id === scannedEquipmentId);

      if (scannedItem) {
        addNotification(`${scannedItem.name} успешно отсканировано`, "success");
        setScannedData({
          name: scannedItem.name,
          key: scannedEquipmentId,
          equipment: scannedItem.name,
          group: scannedItem.group, // Now this field exists
          status: scannedItem.status,
          owner: scannedItem.owner, // Now this field exists
          location: scannedItem.location, // Now this field exists
          available: scannedItem.status === "available",
        });
        setIsPanelOpen(true); // Open the sliding panel
      } else {
        addNotification("Оборудование не найдено", "error");
      }

      setScanning(false);
    }
  }

  const handleError = (err: any) => {
    console.error(err)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({
      ...prev,
      [name]: name === "room" || name === "building" || name === "lab" ? Number(value) : value,
    }));
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    setEquipment((prev) => [...prev, { ...newEquipment, id: `eq-${prev.length + 1}` }]); // Generate a new ID
    setNewEquipment({
      id: "",
      name: "",
      status: "available",
      checkedOutBy: null,
      checkedOutAt: null,
      group: "",
      owner: "",
      location: "",
      room: 0,
      building: 0,
      lab: 0,
    }); // Reset the form
    setIsAddPanelOpen(false); // Close the panel after adding
  };

  const handleAddStudent = (studentData: Omit<Student, "id">) => {
    const newId = `st-${String(students.length + 1).padStart(3, '0')}`;
    const newStudent: Student = {
      id: newId,
      ...studentData
    };

    setStudents([...students, newStudent]);
    addNotification(`Студент ${studentData.name} добавлен в систему`, "success");
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Система управления оборудованием</h1>
            <p className="text-gray-500 mt-2">Учет, отслеживание и управление доступом</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-3/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 pt-6">
                  <div className="flex w-full gap-4 mb-6">
                    <Button 
                      variant={activeTab === "equipment" ? "default" : "outline"}
                      className={`flex-1 py-6 text-lg font-medium ${
                        activeTab === "equipment" 
                          ? "bg-white border-2 border-gray-900 text-gray-900" 
                          : "bg-gray-50 text-gray-500 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab("equipment")}
                    >
                      <div className="flex items-center justify-center">
                        <Package className="mr-2 h-5 w-5" />
                        Инвенторизация
                      </div>
                    </Button>
                    <Button 
                      variant={activeTab === "students" ? "default" : "outline"}
                      className={`flex-1 py-6 text-lg font-medium ${
                        activeTab === "students" 
                          ? "bg-white border-2 border-gray-900 text-gray-900" 
                          : "bg-gray-50 text-gray-500 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab("students")}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="mr-2 h-5 w-5" />
                        Студенты и Доступы
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "equipment" ? (
                    <EquipmentList
                      equipment={equipment}
                      students={students}
                      onReturn={handleEquipmentReturn}
                      onCheckout={handleEquipmentCheckout}
                      onAddEquipment={() => setIsAddPanelOpen(true)}
                      onScanQR={() => setScanning(true)}
                    />
                  ) : (
                    <StudentsList
                      students={students}
                      onToggleAccess={toggleStudentAccess}
                      onAddStudent={handleAddStudent}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/4">
              <div className="sticky top-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Уведомления</h2>
                    <p className="text-sm text-gray-500 mt-1">Недавняя активность</p>
                  </div>
                  <div className="p-0">
                    <NotificationPanel />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {scanning && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Сканирование QR-кода</h2>
              <Scanner
                onScan={handleScan}
                onError={handleError}
              />
              <Button
                onClick={() => setScanning(false)}
                variant="outline"
                className="mt-4 w-full"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {isPanelOpen && (
          <SlidingPanel data={scannedData} onClose={() => setIsPanelOpen(false)}>
            <form className="space-y-4">
              <div>
                <Label>Имя:</Label>
                <Input type="text" value={scannedData?.name} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Ключ:</Label>
                <Input type="text" value={scannedData?.key} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Оборудование:</Label>
                <Input type="text" value={scannedData?.equipment} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Группа:</Label>
                <Input type="text" value={scannedData?.group} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Статус:</Label>
                <Input type="text" value={scannedData?.status} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Владелец:</Label>
                <Input type="text" value={scannedData?.owner} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Место:</Label>
                <Input type="text" value={scannedData?.location} readOnly className="bg-gray-50" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="availability" checked={scannedData?.available} disabled />
                <Label htmlFor="availability">Доступен</Label>
              </div>
            </form>
          </SlidingPanel>
        )}

        {isAddPanelOpen && (
          <AddEquipmentPanel
            onClose={() => setIsAddPanelOpen(false)}
            onSubmit={handleAddEquipment}
            newEquipment={newEquipment}
            handleInputChange={handleInputChange}
            buildings={buildings}
            labs={labs}
            rooms={rooms}
          />
        )}
      </div>
    </NotificationProvider>
  )
}

