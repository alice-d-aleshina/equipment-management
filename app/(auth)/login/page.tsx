"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { searchEquipment } from "@/lib/api"
import { Equipment } from "@/lib/types"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Equipment[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchEquipment(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Поиск оборудования</CardTitle>
          <CardDescription>
            Найдите оборудование по названию
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Название оборудования</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder="Введите название..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                type="button"
              >
                {isSearching ? "Поиск..." : "Найти"}
              </Button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md mt-4">
              <div className="p-2 bg-gray-50 font-medium border-b">Результаты поиска</div>
              <div className="divide-y max-h-60 overflow-auto">
                {searchResults.map((item) => (
                  <div key={item.id} className="p-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">Тип: {item.type}</div>
                    <div className="text-sm text-gray-500">
                      Статус: {
                        item.status === 'available' ? 'Доступно' :
                        item.status === 'in_use' ? 'Используется' :
                        item.status === 'maintenance' ? 'Обслуживание' :
                        item.status === 'broken' ? 'Сломано' :
                        item.status === 'checked-out' ? 'Выдано' : item.status
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-4 text-gray-500">
              Ничего не найдено
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите свои учетные данные для доступа к системе управления оборудованием
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Нет учетной записи?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Регистрация
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 