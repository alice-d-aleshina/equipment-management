"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import type { Equipment } from "@/lib/types"

export default function AddEquipmentPage() {
  const router = useRouter();
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Equipment:", newEquipment);
    router.push("/"); // Redirect to the home page after adding equipment
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Система управления оборудованием</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Добавить новое оборудование</h2>
            <p className="text-gray-600 mt-1">
              Заполните форму ниже для добавления нового оборудования в систему учета.
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddEquipment}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Название оборудования
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Введите название оборудования"
                    value={newEquipment.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Группа
                  </label>
                  <input
                    type="text"
                    id="group"
                    name="group"
                    placeholder="Введите группу оборудования"
                    value={newEquipment.group}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                    Владелец
                  </label>
                  <input
                    type="text"
                    id="owner"
                    name="owner"
                    placeholder="Введите имя владельца"
                    value={newEquipment.owner}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Место
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Введите местоположение"
                    value={newEquipment.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                      Комната
                    </label>
                    <select
                      id="room"
                      name="room"
                      onChange={handleSelectChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите комнату</option>
                      <option value="101">Комната 101</option>
                      <option value="102">Комната 102</option>
                      <option value="103">Комната 103</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                      Здание
                    </label>
                    <select
                      id="building"
                      name="building"
                      onChange={handleSelectChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите здание</option>
                      <option value="1">Здание 1</option>
                      <option value="2">Здание 2</option>
                      <option value="3">Здание 3</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">
                      Лаборатория
                    </label>
                    <select
                      id="lab"
                      name="lab"
                      onChange={handleSelectChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите лабораторию</option>
                      <option value="1">Лаборатория 1</option>
                      <option value="2">Лаборатория 2</option>
                      <option value="3">Лаборатория 3</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Добавить оборудование
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 