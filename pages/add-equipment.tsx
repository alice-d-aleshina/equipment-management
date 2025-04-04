import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import type { Equipment } from "@/lib/types"

const AddEquipmentPage = () => {
  const router = useRouter();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({
      ...prev,
      [name]: name === "room" || name === "building" || name === "lab" ? Number(value) : value,
    }));
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Equipment:", newEquipment);
    router.push("/"); // Adjust the path as necessary
  };

  return (
    <Layout>
      <Card className="max-w-md mx-auto mt-6 shadow-lg border border-gray-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600">Добавить новое оборудование</CardTitle>
          <CardDescription className="text-center text-gray-600">Заполните форму ниже для добавления нового оборудования.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEquipment} className="flex flex-col gap-4">
            <Input
              name="name"
              placeholder="Название оборудования"
              value={newEquipment.name}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="group"
              placeholder="Группа"
              value={newEquipment.group}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="owner"
              placeholder="Владелец"
              value={newEquipment.owner}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="location"
              placeholder="Место"
              value={newEquipment.location}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select name="room" onChange={handleInputChange} required className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Выберите комнату</option>
              {/* Map through your rooms data to create options */}
            </select>
            <select name="building" onChange={handleInputChange} required className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Выберите здание</option>
              {/* Map through your buildings data to create options */}
            </select>
            <select name="lab" onChange={handleInputChange} required className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Выберите лабораторию</option>
              {/* Map through your labs data to create options */}
            </select>
            <Button type="submit" className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition duration-200">
              Добавить оборудование
            </Button>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AddEquipmentPage; 