import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle } from "lucide-react"
import type { Student } from "@/lib/types"

interface StudentsListProps {
  students: Student[]
  onToggleAccess: (studentId: string) => void
}

export default function StudentsList({ students, onToggleAccess }: StudentsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Группа</TableHead>
            <TableHead>Доступ</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.group}</TableCell>
                <TableCell>
                  <Badge>
                    {student.hasAccess ? (
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    {student.hasAccess ? "Разрешено" : "Запрещено"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Switch
                      checked={student.hasAccess}
                      onCheckedChange={() => onToggleAccess(student.id)}
                      className="mr-2"
                    />
                    <span className="text-xs text-muted-foreground">{student.hasAccess ? "Запретить доступ" : "Выдать доступ"}</span>
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

