import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deviceIsMobile, setDeviceIsMobile] = useState<boolean>(false);
  const [useSimpleConstraints, setUseSimpleConstraints] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
    setDeviceIsMobile(isMobile);
    
    // Request camera permissions with flexible constraints
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: isMobile ? 'environment' : 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      .then(() => {
        console.log('Camera access granted');
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        
        // If OverconstrainedError, try with simple constraints
        if (err.name === 'OverconstrainedError') {
          console.log('Trying with simple constraints');
          setUseSimpleConstraints(true);
          
          // Try again with minimal constraints
          navigator.mediaDevices.getUserMedia({ 
            video: true
          })
          .then(() => {
            console.log('Camera access granted with simple constraints');
          })
          .catch((simpleErr) => {
            console.error('Camera access error with simple constraints:', simpleErr);
            setScannerError('Пожалуйста, дайте разрешение на доступ к камере');
          });
        } else {
          setScannerError('Пожалуйста, дайте разрешение на доступ к камере');
        }
      });
    }
  }, []);

  // Add a timeout to force initialization if scanner gets stuck
  useEffect(() => {
    // If scanner is not initialized after 5 seconds, force it
    const timeoutId = setTimeout(() => {
      if (!scannerInitialized) {
        console.log('Scanner initialization timeout - forcing initialization');
        setScannerInitialized(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [scannerInitialized]);

  // Add useEffect to style video element after mount
  useEffect(() => {
    // Function to add styles to the video element created by the Scanner
    const addVideoStyles = () => {
      const videoElement = document.querySelector('.qr-scanner-container video') as HTMLVideoElement;
      if (videoElement) {
        // Apply styles to make video fit properly
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.transform = 'scaleX(1.01)'; // Very slightly scale to avoid thin borders
        console.log('Applied styles to video element');
      } else {
        // If video element isn't found yet, try again in a moment
        setTimeout(addVideoStyles, 100);
      }
    };

    // Start applying styles
    addVideoStyles();
    
    // Also apply styles whenever scanner initializes (backup)
    if (scannerInitialized) {
      setTimeout(addVideoStyles, 100);
    }

    // Keep checking every second in case the video element is replaced
    const interval = setInterval(addVideoStyles, 1000);
    
    return () => clearInterval(interval);
  }, [scannerInitialized]);

  const handleScan = (data: any) => {
    // If camera is initialized and receiving an image,
    // then scanner is considered initialized
    if (!scannerInitialized) {
      setScannerInitialized(true);
    }
    
    if (data) {
      console.log('Scanned data:', data);
      
      // Handle different data formats from scanner
      let scannedValue = '';
      
      // On mobile devices, data can come in different formats
      if (typeof data === 'string') {
        scannedValue = data;
      } else if (data.rawValue) {
        scannedValue = data.rawValue;
      } else if (data.text) {
        scannedValue = data.text;
      } else if (data.data) {
        scannedValue = data.data;
      } else {
        console.log('Unknown data format:', data);
        return;
      }
      
      console.log('Scanned value:', scannedValue);
      onScan(scannedValue);
    }
  };

  const handleError = (err: unknown) => {
    console.error('Scanner error:', err);
    
    let errorMessage = 'Ошибка при доступе к камере';
    
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Доступ к камере был запрещен. Пожалуйста, разрешите доступ к камере в настройках вашего браузера.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Камера не найдена. Пожалуйста, убедитесь, что ваше устройство имеет камеру.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Камера недоступна. Возможно, она используется другим приложением.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Запрошенная конфигурация камеры недоступна.';
        setUseSimpleConstraints(true); // Try simple constraints on this error
      } else if (err.name === 'StreamApiNotSupportedError') {
        errorMessage = 'API потоковой передачи не поддерживается в этом браузере.';
      }
    }
    
    setScannerError(errorMessage);
  };

  const retryScanner = () => {
    setScannerError(null);
    setScannerInitialized(false);
    
    // Force reset and reactivate scanning
    const scannerElement = document.querySelector('.qr-scanner-container');
    if (scannerElement) {
      try {
        // Force a re-render by removing and re-adding the element
        scannerElement.innerHTML = '';
        setTimeout(() => {
          // Re-create the scanner component
          renderScanner();
        }, 500);
      } catch (error) {
        console.error('Error during retry:', error);
      }
    }
  };

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
            
            // Here should be a call to a library for QR code recognition from the image
            // In this implementation, we simply show the user an error message
            
            alert('Обработка QR-кода из файла не реализована');
            // Reset input file value so you can upload the same file again
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Ошибка при обработке изображения');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // For debugging - simulate a successful QR scan
  const simulateScan = () => {
    console.log("Simulating QR scan");
    onScan("DEMO-QR-CODE-123");
  };

  const renderScanner = () => {
    if (scannerError) {
      return (
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
      );
    }

    return (
      <div className="qr-scanner-container relative rounded-lg overflow-hidden border border-gray-200">
        {/* Perfect square container with 100% width */}
        <div className="w-full" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            <div className="w-full h-full" style={{ 
              position: 'relative', 
              overflow: 'hidden'
            }}>
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={useSimpleConstraints ? 
                  undefined : // Use default constraints if simple mode
                  {
                    facingMode: { ideal: deviceIsMobile ? 'environment' : 'user' },
                    width: { ideal: 1280 },
                    height: { ideal: 1280 } // Make height match width for square aspect ratio
                  }
                }
              />
            </div>
          </div>
        </div>
        
        {/* Red scanning frame overlay with larger size */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-red-500 rounded-lg w-4/5 h-4/5"></div>
        </div>
        
        {!scannerInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Инициализация камеры...</p>
            </div>
          </div>
        )}
        
        {/* Additional scanning instructions */}
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-75 p-2 rounded-lg text-xs text-center">
          <p>Направьте камеру на QR-код оборудования и держите устройство неподвижно</p>
        </div>
        
        {/* Debugging button to simulate a scan */}
        <Button
          onClick={simulateScan}
          className="absolute top-2 right-2 bg-green-500 text-white p-1 text-xs rounded"
        >
          ТЕСТ: Симулировать скан
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Сканирование QR-кода</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="camera" onValueChange={(val) => setScanMode(val as 'camera' | 'upload')}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="camera" className="flex-1">
            <Camera className="mr-2 h-4 w-4" />
            Камера
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="mr-2 h-4 w-4" />
            Загрузить файл
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera">
          {renderScanner()}
        </TabsContent>
        
        <TabsContent value="upload">
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {scanMode === 'camera' 
          ? 'Наведите камеру на QR-код оборудования' 
          : 'Выберите файл с изображением QR-кода'}
      </div>
      
      <Button
        onClick={onClose}
        variant="outline"
        className="mt-4 w-full rounded-xl"
      >
        Отмена
      </Button>
    </div>
  );
};

export default QRScanner; 