import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle } from "lucide-react"
import type { Student } from "@/lib/types"
import { useState, useEffect } from "react"

interface StudentsListProps {
  students: Student[]
  onToggleAccess: (studentId: string) => void
}

export default function StudentsList({ students, onToggleAccess }: StudentsListProps) {
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

  // Мобильный вид для маленьких экранов
  if (showMobileView) {
    return (
      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
            Студенты не найдены
          </div>
        ) : (
          students.map((student) => (
            <div 
              key={student.id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <Badge className={`${student.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center`}>
                    {student.hasAccess ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {student.hasAccess ? "Разрешено" : "Запрещено"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>ID: {student.id}</p>
                  <p>Группа: {student.group}</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Доступ</span>
                <div className="flex items-center">
                  <Switch
                    checked={student.hasAccess}
                    onCheckedChange={() => onToggleAccess(student.id)}
                    className={`${student.hasAccess ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full`}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {student.hasAccess ? "Включен" : "Выключен"}
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
            <TableHead>ФИО</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Группа</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Доступ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Студенты не найдены
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.group}</TableCell>
                <TableCell>
                  <Badge className={`${student.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center`}>
                    {student.hasAccess ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {student.hasAccess ? "Разрешено" : "Запрещено"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Switch
                      checked={student.hasAccess}
                      onCheckedChange={() => onToggleAccess(student.id)}
                      className={`${student.hasAccess ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full`}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {student.hasAccess ? "Включен" : "Выключен"}
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

