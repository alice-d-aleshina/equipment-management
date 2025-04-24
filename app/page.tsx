"use client"

import EquipmentDashboard from '@/components/dashboard/equipment-dashboard';
import { NotificationProvider } from "@/lib/context/NotificationContext"

const HomePage = () => {
  return (
    <NotificationProvider>
      <EquipmentDashboard />
    </NotificationProvider>
  );
};

export default HomePage; 