"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Database, Package, Users, Scan, X, Upload, Camera, BellOff, CheckCircle, AlertCircle, Info } from "lucide-react"
import EquipmentList from "@/components/equipment/equipment-list"
import StudentsList from "@/components/students/students-list"
import NotificationPanel from "@/components/notifications/notification-panel"
import CardReaderSimulator from "@/components/card-reader/card-reader-simulator"
import QRScanner from "@/components/qr-scanner/qr-scanner"
import type { Equipment, Student, Notification, Building, Lab, Room } from "@/lib/types"
import { initialEquipment, initialStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { io, Socket } from "socket.io-client"
import { useNotifications } from "@/lib/context/NotificationContext"

// Define interfaces for WebSocket data
interface CardScanData {
  cardId: string;
  cardType: string;
}

interface StatusUpdateData {
  status: string;
}

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

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
  newEquipment: Partial<Equipment>;
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
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [students, setStudents] = useState<Student[]>([])
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
  const [buildings, setBuildings] = useState<Building[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    id: "",
    name: "",
    nameEn: "",
    type: "",
    status: "available",
    location: "",
    lastMaintenance: "",
    nextMaintenance: "",
    qrCode: "",
    checkedOutBy: null,
    checkedOutAt: null,
    group: "",
    owner: "",
    room: 0,
    building: 0,
    lab: 0,
  });
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("equipment");
  const [deviceIsMobile, setDeviceIsMobile] = useState<boolean>(false);
  const [lastScannedCardId, setLastScannedCardId] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const { addNotification, clearNotifications } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch buildings, labs, and rooms
        const buildingsResponse = await fetch('/api/buildings');
        const labsResponse = await fetch('/api/labs');
        const roomsResponse = await fetch('/api/rooms');

        // Fetch equipment and students
        const equipmentResponse = await fetch('/api/equipment');
        const studentsResponse = await fetch('/api/users');

        const buildingsData = await buildingsResponse.json();
        const labsData = await labsResponse.json();
        const roomsData = await roomsResponse.json();
        const equipmentData = await equipmentResponse.json();
        const studentsData = await studentsResponse.json();

        setBuildings(buildingsData);
        setLabs(labsData);
        setRooms(roomsData);
        setEquipment(equipmentData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        addNotification("Ошибка при загрузке данных", "error");
      }
    };

    fetchData();
  }, []);

  // Определяем, является ли устройство мобильным
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      setDeviceIsMobile(isMobile);
    };
    
    checkIfMobile();
  }, []);

  // Connect to WebSocket server
  useEffect(() => {
    // Connect to the Arduino card reader server WebSocket
    socketRef.current = io('http://localhost:3001');
    console.log('WebSocket connecting to http://localhost:3001');
    
    // Listen for card scan events
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected!');
      addNotification('WebSocket подключен к серверу кард-ридера', 'success');
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      addNotification('Ошибка подключения к серверу кард-ридера', 'error');
    });
    
    // Listen for card scan events
    socketRef.current.on('card_scan', (data: CardScanData) => {
      console.log('Card scanned:', data);
      if (data.cardId) {
        setLastScannedCardId(data.cardId);
        handleCardScan(data.cardId);
      }
    });
    
    // Listen for status updates
    socketRef.current.on('status_update', (data: StatusUpdateData) => {
      console.log('Status update:', data);
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle equipment checkout
  const handleEquipmentCheckout = async (studentId: string, equipmentId: string) => {
    try {
      const response = await fetch(`/api/equipment/${equipmentId}?action=checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(studentId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to checkout equipment');
      }

      const updatedEquipment = await response.json();
      
      // Update local state
      setEquipment(prev => 
        prev.map(item => item.id === equipmentId ? updatedEquipment : item)
      );

      const student = students.find((s) => s.id === studentId);
      const item = equipment.find((e) => e.id === equipmentId);
      
      if (student && item) {
        addNotification(`${item.name} выдано студенту ${student.name}`, "success");
      }
    } catch (error) {
      console.error('Error checking out equipment:', error);
      addNotification("Ошибка при выдаче оборудования", "error");
    }
  }

  // Handle equipment return
  const handleEquipmentReturn = async (equipmentId: string) => {
    try {
      const item = equipment.find((e) => e.id === equipmentId);
      
      const response = await fetch(`/api/equipment/${equipmentId}?action=checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to checkin equipment');
      }

      const updatedEquipment = await response.json();
      
      // Update local state
      setEquipment(prev => 
        prev.map(item => item.id === equipmentId ? updatedEquipment : item)
      );

      if (item) {
        addNotification(`${item.name} возвращено`, "info");
      }
    } catch (error) {
      console.error('Error returning equipment:', error);
      addNotification("Ошибка при возврате оборудования", "error");
    }
  }

  // Toggle student access
  const toggleStudentAccess = async (studentId: string) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      
      const action = student.hasAccess ? 'revoke' : 'grant';
      
      const response = await fetch(`/api/users/${studentId}?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} access`);
      }

      const updatedStudent = await response.json();
      
      // Update local state
      setStudents(prev => 
        prev.map(s => s.id === studentId ? updatedStudent : s)
      );

      addNotification(
        `Доступ ${updatedStudent.hasAccess ? "разрешен" : "запрещен"} для ${updatedStudent.name}`,
        "info"
      );
    } catch (error) {
      console.error('Error toggling student access:', error);
      addNotification("Ошибка при изменении доступа", "error");
    }
  }

  // Modified handleCardScan to update lastScannedCardId
  const handleCardScan = (cardId: string) => {
    if (!cardId) return;
    
    console.log('Handling card scan for ID:', cardId);
    setLastScannedCardId(cardId);
    
    // Форматируем ID карты для отображения
    const formattedCardId = cardId.replace(/\s/g, '').toUpperCase();
    
    // Add notification showing the scanned card ID
    addNotification(`Отсканирована карта: ${formattedCardId}`, "info");
    
    // Find student with matching card ID
    const matchingStudent = students.find(
      (student) => student.card_id && student.card_id.toUpperCase() === formattedCardId.toUpperCase()
    );
    
    if (matchingStudent) {
      // Student found
      console.log('Found student:', matchingStudent);
      addNotification(`Карта верифицирована: ${matchingStudent.name} (ID: ${formattedCardId})`, "success");
      
      // Check if student has access
      if (!matchingStudent.hasAccess) {
        addNotification(`Доступ запрещен для ${matchingStudent.name} (ID: ${formattedCardId})`, "error");
      } else {
        addNotification(`Доступ разрешен для ${matchingStudent.name} (ID: ${formattedCardId})`, "success");
      }
    } else {
      // No matching student found
      console.log('No matching student found for card:', formattedCardId);
      addNotification(`Карта не связана ни с одним студентом (ID: ${formattedCardId})`, "error");
    }
  };

  const handleScanNFC = () => {
    setScanning(true)
  }

  const handleQRScan = (scannedValue: string) => {
    // Find equipment by scanned value
    const scannedItem = equipment.find(item => item.id === scannedValue);

    if (scannedItem) {
      addNotification(`${scannedItem.name} успешно отсканировано`, "success");
      setScannedData({
        name: scannedItem.name,
        key: scannedValue,
        equipment: scannedItem.name,
        group: scannedItem.group,
        status: scannedItem.status,
        owner: scannedItem.owner,
        location: scannedItem.location,
        available: scannedItem.status === "available",
      });
      setIsPanelOpen(true); // Open the sliding panel
    } else {
      console.log("Equipment not found for ID:", scannedValue);
      addNotification("Оборудование не найдено: " + scannedValue, "error");
    }

    setScanning(false);
  };
  
  const closeScanningModal = () => {
    setScanning(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({
      ...prev,
      [name]: name === "room" || name === "building" || name === "lab" ? Number(value) : value,
    }));
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (!response.ok) {
        throw new Error('Failed to add equipment');
      }

      const createdEquipment = await response.json();
      
      // Update local state
      setEquipment(prev => [...prev, createdEquipment]);
      
      // Reset form and close panel
      setNewEquipment({
        id: "",
        name: "",
        nameEn: "",
        type: "",
        status: "available",
        location: "",
        lastMaintenance: "",
        nextMaintenance: "",
        qrCode: "",
        checkedOutBy: null,
        checkedOutAt: null,
        group: "",
        owner: "",
        room: 0,
        building: 0,
        lab: 0,
      });
      setIsAddPanelOpen(false);
      
      addNotification(`Оборудование ${createdEquipment.name} добавлено`, "success");
    } catch (error) {
      console.error('Error adding equipment:', error);
      addNotification("Ошибка при добавлении оборудования", "error");
    }
  }

  const handleAddStudent = async (studentData: Omit<Student, "id">) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      const createdStudent = await response.json();
      
      // Update local state
      setStudents(prev => [...prev, createdStudent]);
      
      addNotification(`Студент ${createdStudent.name} добавлен`, "success");
    } catch (error) {
      console.error('Error adding student:', error);
      addNotification("Ошибка при добавлении студента", "error");
    }
  }

  const startScanning = () => {
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Система управления оборудованием</h1>
          <p className="text-gray-500 mt-1 sm:mt-2">Учет, отслеживание и управление доступом</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex w-full gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <Button 
                    variant={activeTab === "equipment" ? "default" : "outline"}
                    className={`flex-1 py-3 sm:py-6 text-base sm:text-lg font-medium rounded-xl focus:outline-none focus-visible:ring-0 ${
                      activeTab === "equipment" 
                        ? "bg-white border-2 border-gray-900 text-gray-900" 
                        : "bg-gray-50 text-gray-500 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("equipment")}
                  >
                    <div className="flex items-center justify-center">
                      <Package className="mr-2 h-5 w-5" />
                      <span>Оборудование</span>
                    </div>
                  </Button>
                  <Button 
                    variant={activeTab === "students" ? "default" : "outline"}
                    className={`flex-1 py-3 sm:py-6 text-base sm:text-lg font-medium rounded-xl focus:outline-none focus-visible:ring-0 ${
                      activeTab === "students" 
                        ? "bg-white border-2 border-gray-900 text-gray-900" 
                        : "bg-gray-50 text-gray-500 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("students")}
                  >
                    <div className="flex items-center justify-center">
                      <Users className="mr-2 h-5 w-5" />
                      <span>Студенты и Доступы</span>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="p-3 sm:p-6">
                {activeTab === "equipment" ? (
                  <EquipmentList
                    equipment={equipment}
                    students={students}
                    onReturn={handleEquipmentReturn}
                    onCheckout={handleEquipmentCheckout}
                    onAddEquipment={() => setIsAddPanelOpen(true)}
                    onScanQR={startScanning}
                  />
                ) : (
                  <StudentsList
                    students={students}
                    onToggleAccess={toggleStudentAccess}
                    onAddStudent={handleAddStudent}
                    scannedCardId={lastScannedCardId}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/4">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Уведомления</h2>
                  <p className="text-sm text-gray-500 mt-1">Недавняя активность</p>
                </div>
                <div className="p-0">
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-gray-500 h-[300px]">
                    <BellOff className="h-12 w-12 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Настроена панель уведомлений</h3>
                    <p className="text-sm text-center">Смотрите уведомления в правом верхнем углу экрана</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scanning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <QRScanner onScan={handleQRScan} onClose={closeScanningModal} />
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
  )
}

