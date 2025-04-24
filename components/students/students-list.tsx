import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, Search, Filter, UserPlus, X, CreditCard } from "lucide-react"
import type { Student } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add Student Panel Component
const AddStudentPanel = ({ 
  onClose, 
  onAddStudent 
}: { 
  onClose: () => void; 
  onAddStudent: (student: Omit<Student, "id">) => void;
}) => {
  const [newStudent, setNewStudent] = useState<Omit<Student, "id">>({
    name: "",
    group: "",
    hasAccess: false
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccessChange = (value: string) => {
    setNewStudent((prev) => ({
      ...prev,
      hasAccess: value === "yes"
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent(newStudent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Добавить студента</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ФИО студента</Label>
            <Input
              id="name"
              name="name"
              value={newStudent.name}
              onChange={handleInputChange}
              placeholder="Иванов Иван Иванович"
              className="w-full h-10 rounded-xl"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group">Группа</Label>
            <Input
              id="group"
              name="group"
              value={newStudent.group}
              onChange={handleInputChange}
              placeholder="CS-101"
              className="w-full h-10 rounded-xl"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="access">Доступ к оборудованию</Label>
            <Select 
              onValueChange={handleAccessChange} 
              defaultValue="no"
            >
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="Выберите статус доступа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Разрешен</SelectItem>
                <SelectItem value="no">Запрещен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={isMobile ? "w-full rounded-xl" : "rounded-xl"}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className={`bg-blue-600 hover:bg-blue-700 rounded-xl ${isMobile ? "w-full" : ""}`}
            >
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StudentsListProps {
  students: Student[]
  onToggleAccess: (studentId: string) => void
  onAddStudent?: (student: Omit<Student, "id">) => void
  scannedCardId?: string
}

export default function StudentsList({ students, onToggleAccess, onAddStudent, scannedCardId }: StudentsListProps) {
  const [showMobileView, setShowMobileView] = useState(window.innerWidth < 768);
  const [filterAccess, setFilterAccess] = useState<'all' | 'granted' | 'denied'>('all');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [studentsWithVerification, setStudentsWithVerification] = useState<(Student & { cardVerified: boolean })[]>([]);

  // Get unique groups from students
  const studentGroups = ['all', ...Array.from(new Set(students.map(student => student.group)))];

  // Update students with verification status when scanned card changes
  useEffect(() => {
    const updatedStudents = students.map(student => ({
      ...student,
      cardVerified: student.card_id && scannedCardId 
        ? student.card_id.toUpperCase() === scannedCardId.toUpperCase()
        : false
    }));
    setStudentsWithVerification(updatedStudents);
  }, [students, scannedCardId]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle add student
  const handleAddStudent = (studentData: Omit<Student, "id">) => {
    if (onAddStudent) {
      onAddStudent(studentData);
      setIsAddPanelOpen(false);
    }
  };

  // Filter students based on access, search query and group
  const filteredStudents = studentsWithVerification.filter(student => {
    const matchesAccess = filterAccess === 'all' || 
                        (filterAccess === 'granted' && student.hasAccess) || 
                        (filterAccess === 'denied' && !student.hasAccess);
    const matchesSearch = searchQuery === '' || 
                        student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === 'all' || student.group === groupFilter;
    
    return matchesAccess && matchesSearch && matchesGroup;
  });

  // Mobile view
  if (showMobileView) {
    return (
      <div className="bg-white">
        {scannedCardId && (
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-blue-800">Последняя отсканированная карта</h3>
                <p className="text-lg font-bold text-blue-900 mt-1">{scannedCardId}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        )}
        <div className="border-b border-gray-200 p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-1 flex-1">
              <Button 
                size="sm" 
                variant={filterAccess === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterAccess('all')}
                className={`flex-1 text-sm font-medium rounded-xl focus:outline-none focus-visible:ring-0 ${
                  filterAccess === 'all' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                Все
              </Button>
              <Button 
                size="sm" 
                variant={filterAccess === 'granted' ? 'default' : 'outline'}
                onClick={() => setFilterAccess('granted')}
                className={`flex-1 text-sm font-medium rounded-xl focus:outline-none focus-visible:ring-0 ${
                  filterAccess === 'granted' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-800 border border-green-200'
                }`}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Разрешен
              </Button>
              <Button 
                size="sm" 
                variant={filterAccess === 'denied' ? 'default' : 'outline'}
                onClick={() => setFilterAccess('denied')}
                className={`flex-1 text-sm font-medium rounded-xl focus:outline-none focus-visible:ring-0 ${
                  filterAccess === 'denied' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-800 border border-red-200'
                }`}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Запрещен
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 ml-2 h-9 w-9 p-0 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-0"
              onClick={() => setIsAddPanelOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск по ФИО студента..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 w-full h-10 rounded-xl"
              />
            </div>
            
            <Select 
              value={groupFilter} 
              onValueChange={setGroupFilter}
            >
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="Фильтр по группе" />
              </SelectTrigger>
              <SelectContent>
                {studentGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group === 'all' ? 'Все группы' : group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Студенты не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {student.name.charAt(0)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{student.name}</p>
                      <Badge className={`${student.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-xl`}>
                        {student.hasAccess ? "Разрешено" : "Запрещено"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>ID: {student.id}</p>
                      <p>Группа: {student.group}</p>
                      <div className="flex items-center mt-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {student.cardVerified 
                          ? <span className="text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Верифицирована</span>
                          : <span className="text-red-600 flex items-center"><XCircle className="h-3 w-3 mr-1" /> Не верифицирована</span>
                        }
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`w-full ${
                          student.hasAccess 
                            ? 'border-red-200 text-red-600 hover:bg-red-50 rounded-xl' 
                            : 'border-green-200 text-green-600 hover:bg-green-50 rounded-xl'
                        }`}
                        onClick={() => onToggleAccess(student.id)}
                      >
                        {student.hasAccess ? "Запретить" : "Разрешить"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddPanelOpen && (
          <AddStudentPanel
            onClose={() => setIsAddPanelOpen(false)}
            onAddStudent={handleAddStudent}
          />
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="bg-white">
      {scannedCardId && (
        <div className="bg-blue-50 p-6 mb-4 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Последняя отсканированная карта</h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">{scannedCardId}</p>
              <p className="text-sm text-blue-600 mt-1">Карта отсканирована и готова к верификации</p>
            </div>
            <div className="bg-white p-4 rounded-full border border-blue-200">
              <CreditCard className="h-10 w-10 text-blue-500" />
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filterAccess === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterAccess('all')}
              className="focus:outline-none focus-visible:ring-0"
            >
              Все студенты
            </Button>
            <Button 
              size="sm" 
              variant={filterAccess === 'granted' ? 'default' : 'outline'}
              onClick={() => setFilterAccess('granted')}
              className="bg-green-600 hover:bg-green-700 text-white focus:outline-none focus-visible:ring-0"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Доступ разрешен
            </Button>
            <Button 
              size="sm" 
              variant={filterAccess === 'denied' ? 'default' : 'outline'}
              onClick={() => setFilterAccess('denied')}
              className="bg-red-600 hover:bg-red-700 text-white focus:outline-none focus-visible:ring-0"
            >
              <XCircle className="mr-1 h-4 w-4" />
              Доступ запрещен
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-blue-600 focus:outline-none focus-visible:ring-0"
            onClick={() => setIsAddPanelOpen(true)}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Добавить студента
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск по ФИО студента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          
          <Select 
            value={groupFilter} 
            onValueChange={setGroupFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Фильтр по группе" />
            </SelectTrigger>
            <SelectContent>
              {studentGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group === 'all' ? 'Все группы' : group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Студенты не найдены</h3>
          <p className="mt-1 text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Группа</TableHead>
              <TableHead className="text-center">Статус доступа</TableHead>
              <TableHead className="text-center">Карта</TableHead>
              <TableHead className="text-center">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {student.name.charAt(0)}
                  </Avatar>
                  <span>{student.name}</span>
                </TableCell>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.group}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`inline-flex items-center ${
                    student.hasAccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.hasAccess 
                      ? <CheckCircle className="mr-1 h-3 w-3" /> 
                      : <XCircle className="mr-1 h-3 w-3" />
                    }
                    {student.hasAccess ? "Разрешено" : "Запрещено"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`inline-flex items-center ${
                    student.cardVerified
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.cardVerified
                      ? <CheckCircle className="mr-1 h-3 w-3" /> 
                      : <XCircle className="mr-1 h-3 w-3" />
                    }
                    {student.cardVerified ? "Верифицирована" : "Не верифицирована"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${
                      student.hasAccess 
                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                    onClick={() => onToggleAccess(student.id)}
                  >
                    {student.hasAccess ? "Запретить доступ" : "Разрешить доступ"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isAddPanelOpen && (
        <AddStudentPanel
          onClose={() => setIsAddPanelOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}
    </div>
  );
}

