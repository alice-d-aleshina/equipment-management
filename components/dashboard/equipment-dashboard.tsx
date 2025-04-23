"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Database, Package, Users, Scan, X, Upload, Camera } from "lucide-react"
import EquipmentList from "@/components/equipment/equipment-list"
import StudentsList from "@/components/students/students-list"
import NotificationPanel from "@/components/notifications/notification-panel"
import CardReaderSimulator from "@/components/card-reader/card-reader-simulator"
import { Scanner } from '@yudiel/react-qr-scanner'
import type { Equipment, Student, Notification, Building, Lab, Room } from "@/lib/types"
import { initialEquipment, initialStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { NotificationProvider } from "@/lib/context/NotificationContext"
import { Tabs as UITabs, TabsContent as UITabsContent, TabsList as UITabsList, TabsTrigger as UITabsTrigger } from "@/components/ui/tabs"

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
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "upload">("camera");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deviceIsMobile, setDeviceIsMobile] = useState<boolean>(false);
  const [isSimulatingScanning, setIsSimulatingScanning] = useState<boolean>(false);
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState<boolean>(false);

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

  // Определяем, является ли устройство мобильным и запрашиваем разрешение на камеру
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      setDeviceIsMobile(isMobile);
    };
    
    checkIfMobile();

    // Запрашиваем разрешение на камеру при загрузке приложения
    if (!cameraPermissionRequested) {
      requestCameraPermission();
    }
  }, [cameraPermissionRequested]);

  // Функция для запроса разрешения на камеру
  const requestCameraPermission = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment" 
        }, 
        audio: false 
      })
      .then(function(stream) {
        console.log("Доступ к камере получен при загрузке приложения");
        // Закрываем поток, так как он будет использован позже при сканировании
        stream.getTracks().forEach(track => track.stop());
        // Отмечаем, что разрешение запрошено
        setCameraPermissionRequested(true);
      })
      .catch(function(err) {
        console.error("Ошибка доступа к камере при загрузке приложения:", err);
        setCameraPermissionRequested(true); // Отмечаем, что попытка была совершена
        
        let errorMessage = "Произошла ошибка при запросе доступа к камере";
        
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          const isAndroid = /Android/i.test(navigator.userAgent);
          if (isAndroid) {
            errorMessage = "Для корректной работы приложения необходим доступ к камере. На Android: откройте настройки браузера, найдите разрешения сайтов, найдите этот сайт и разрешите доступ к камере.";
          } else {
            errorMessage = "Для корректной работы приложения необходим доступ к камере. Пожалуйста, разрешите доступ к камере в настройках вашего браузера.";
          }
          
          addNotification(errorMessage, "info");
        }
      });
    }
  };

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
    // Если камера инициализирована и получает изображение,
    // то сканер считается инициализированным
    if (!scannerInitialized) {
      setScannerInitialized(true);
    }
    
    if (data) {
      console.log("Scanned data:", data);
      
      // Обработка разных форматов данных от сканера
      let scannedValue = "";
      
      // На мобильных устройствах данные могут приходить в разных форматах
      if (typeof data === 'string') {
        scannedValue = data;
      } else if (data.rawValue) {
        scannedValue = data.rawValue;
      } else if (data.text) {
        scannedValue = data.text;
      } else if (data.data) {
        scannedValue = data.data;
      } else {
        console.log("Неизвестный формат данных:", data);
        addNotification("Неизвестный формат QR-кода", "error");
        return;
      }
      
      console.log("Scanned value:", scannedValue);
      
      // Поиск оборудования по отсканированному значению
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
    }
  }

  const handleError = (err: unknown) => {
    console.error("Ошибка сканера:", err);
    
    let errorMessage = "Ошибка при доступе к камере";
    
    if (err instanceof Error) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
          errorMessage = "Доступ к камере был запрещен. На Android: откройте настройки браузера, найдите разрешения сайтов, найдите этот сайт и разрешите доступ к камере.";
        } else {
          errorMessage = "Доступ к камере был запрещен. Пожалуйста, разрешите доступ к камере в настройках вашего браузера.";
        }
      } else if (err.name === "NotFoundError") {
        errorMessage = "Камера не найдена. Пожалуйста, убедитесь, что ваше устройство имеет камеру.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Камера недоступна. Возможно, она используется другим приложением.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Запрошенная конфигурация камеры недоступна.";
      } else if (err.name === "StreamApiNotSupportedError") {
        errorMessage = "API потоковой передачи не поддерживается в этом браузере.";
      }
    }
    
    setScannerError(errorMessage);
    addNotification("Ошибка камеры: " + errorMessage, "error");
  };

  const retryScanner = () => {
    setScannerError(null);
    setScannerInitialized(false);
    // Принудительно сбрасываем и повторно активируем сканирование
    setScanning(false);
    setTimeout(() => setScanning(true), 500);
  }
  
  const closeScanningModal = () => {
    setScanning(false);
    setScannerError(null);
    setScannerInitialized(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (context) {
            context.drawImage(img, 0, 0, img.width, img.height);
            
            // Здесь должен быть вызов библиотеки для распознавания QR кода из изображения
            // В данной реализации мы просто показываем пользователю сообщение об ошибке
            
            addNotification("Обработка QR-кода из файла не реализована", "error");
            // Сбрасываем значение input file, чтобы можно было загрузить тот же файл повторно
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Error processing image:", error);
          addNotification("Ошибка при обработке изображения", "error");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      img.src = event.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Симулируем сканирование QR-кода на мобильном устройстве
  const simulateScan = () => {
    setIsSimulatingScanning(true);
    
    // Устанавливаем таймер для имитации процесса сканирования
    const loadingTimeout = setTimeout(() => {
      try {
        // Демонстрационные данные оборудования для мобильных устройств
        const demoEquipmentData = [
          {
            id: "AR-01",
            name: "Arduino UNO",
            group: "Микроконтроллеры",
            status: "available",
            owner: "Лаборатория робототехники",
            location: "Room 101",
          },
          {
            id: "OS-05",
            name: "Осциллограф Tektronix",
            group: "Измерительное оборудование",
            status: "in_use",
            owner: "Физический факультет",
            location: "Room 202",
          },
          {
            id: "MS-03",
            name: "Микроскоп Leica",
            group: "Оптические приборы",
            status: "available",
            owner: "Химический факультет",
            location: "Room 305",
          }
        ];
        
        // Выбираем случайное оборудование из демо-данных
        const randomIndex = Math.floor(Math.random() * demoEquipmentData.length);
        const demoEquipment = demoEquipmentData[randomIndex];
        
        addNotification(`${demoEquipment.name} успешно отсканировано`, "success");
        setScannedData({
          name: demoEquipment.name,
          key: demoEquipment.id,
          equipment: demoEquipment.name,
          group: demoEquipment.group,
          status: demoEquipment.status,
          owner: demoEquipment.owner,
          location: demoEquipment.location,
          available: demoEquipment.status === "available",
        });
        
        setIsSimulatingScanning(false);
        setIsPanelOpen(true);
        setScanning(false);
      } catch (error) {
        console.error("Error in demo scan:", error);
        addNotification("Ошибка при сканировании", "error");
        setIsSimulatingScanning(false);
        setScanning(false);
      }
    }, 1500); // Задержка для имитации процесса сканирования
    
    // Очистка таймера при размонтировании компонента
    return () => {
      clearTimeout(loadingTimeout);
      setIsSimulatingScanning(false);
    };
  };

  // Обновляем функцию начала сканирования с учетом мобильных устройств
  const startScanning = () => {
    setScannerError(null);
    setScannerInitialized(false);
    setScanning(true);
    
    // Если устройство мобильное, установим режим камеры по умолчанию
    if (deviceIsMobile) {
      setScanMode("camera");
      
      // Проверяем, было ли уже запрошено разрешение на камеру
      if (!cameraPermissionRequested) {
        // Если разрешение не запрашивалось ранее, запросим его сейчас
        requestCameraPermission();
      } else {
        // Если разрешение уже запрашивалось, повторно запросим для подстраховки
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: "environment"  // Использовать заднюю камеру на мобильных устройствах
            },
            audio: false
          })
          .then(function(stream) {
            console.log("Доступ к камере получен");
            // Закрываем поток камеры, так как он будет открыт компонентом Scanner
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(function(err) {
            console.error("Ошибка доступа к камере:", err);
            let errorMessage = "Ошибка доступа к камере";
            
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
              errorMessage = "Доступ к камере был запрещен. Пожалуйста, разрешите доступ к камере в настройках вашего браузера.";
              
              // Специальные инструкции для Android
              const isAndroid = /Android/i.test(navigator.userAgent);
              if (isAndroid) {
                errorMessage = "Доступ к камере был запрещен. На Android: откройте настройки браузера, найдите разрешения сайтов, найдите этот сайт и разрешите доступ к камере.";
              }
            }
            
            setScannerError(errorMessage);
          });
        } else {
          setScannerError("Ваш браузер не поддерживает API камеры. Пожалуйста, используйте современный браузер.");
        }
      }
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Баннер с запросом разрешения на камеру */}
        {!cameraPermissionRequested && (
          <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 z-50">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Для работы приложения требуется доступ к камере</p>
                <p className="text-sm opacity-90">Пожалуйста, разрешите доступ к камере в диалоговом окне</p>
              </div>
              <Button 
                variant="outline" 
                className="ml-4 bg-white/20 hover:bg-white/30 text-white border-white/40"
                onClick={requestCameraPermission}
              >
                Разрешить
              </Button>
            </div>
          </div>
        )}
        
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
                    <NotificationPanel />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {scanning && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Сканирование QR-кода</h2>
                <Button
                  onClick={closeScanningModal}
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <UITabs defaultValue="camera" onValueChange={(val) => setScanMode(val as "camera" | "upload")}>
                <UITabsList className="w-full mb-4">
                  <UITabsTrigger value="camera" className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Камера
                  </UITabsTrigger>
                  <UITabsTrigger value="upload" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить файл
                  </UITabsTrigger>
                </UITabsList>
                
                <UITabsContent value="camera">
                  {scannerError ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        <p className="font-medium mb-1">Ошибка доступа к камере:</p>
                        <p>{scannerError}</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Возможные причины:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Нет разрешения на доступ к камере в браузере</li>
                          <li>Камера используется другим приложением</li>
                          <li>Ваше устройство не поддерживает API камеры</li>
                        </ul>
                      </div>
                      <Button
                        onClick={retryScanner}
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                      >
                        Повторить попытку
                      </Button>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <div className="aspect-square w-full bg-gray-100">
                        <div className="w-full h-full">
                          <Scanner
                            onScan={handleScan}
                            onError={handleError}
                          />
                        </div>
                      </div>
                      {!scannerInitialized && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Инициализация камеры...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Дополнительные инструкции по сканированию */}
                      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-75 p-2 rounded-lg text-xs text-center">
                        <p>Направьте камеру на QR-код оборудования и держите устройство неподвижно</p>
                      </div>
                    </div>
                  )}
                </UITabsContent>
                
                <UITabsContent value="upload">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Загрузите изображение с QR-кодом</p>
                      <Button 
                        onClick={triggerFileUpload}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Выбрать файл
                      </Button>
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      Поддерживаемые форматы: JPG, PNG, GIF
                    </p>
                  </div>
                </UITabsContent>
              </UITabs>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {scanMode === "camera" 
                  ? "Наведите камеру на QR-код оборудования" 
                  : "Выберите файл с изображением QR-кода"}
              </div>
              
              <Button
                onClick={closeScanningModal}
                variant="outline"
                className="mt-4 w-full rounded-xl"
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

