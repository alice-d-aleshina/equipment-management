import { useState, useEffect } from 'react';
import { 
  getEquipment, 
  getEquipmentById, 
  getEquipmentByQrCode,
  createEquipment,
  updateEquipment,
  checkoutEquipment,
  checkinEquipment,
  Equipment
} from '../utils/equipmentService';

export const useEquipmentList = (filters?: any) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await getEquipment(filters);
        setEquipment(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [filters]);

  return { equipment, loading, error };
};

export const useEquipmentItem = (id?: number, qrCode?: string) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id && !qrCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let data;
        
        if (id) {
          data = await getEquipmentById(id);
        } else if (qrCode) {
          data = await getEquipmentByQrCode(qrCode);
        }
        
        setEquipment(data || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, qrCode]);

  const handleUpdate = async (updates: Partial<Equipment>) => {
    if (!equipment?.id) return null;
    
    try {
      setLoading(true);
      const updatedEquipment = await updateEquipment(equipment.id, updates);
      setEquipment(updatedEquipment);
      return updatedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (userId: number) => {
    if (!equipment?.id) return null;
    
    try {
      setLoading(true);
      const updatedEquipment = await checkoutEquipment(equipment.id, userId);
      setEquipment(updatedEquipment);
      return updatedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!equipment?.id) return null;
    
    try {
      setLoading(true);
      const updatedEquipment = await checkinEquipment(equipment.id);
      setEquipment(updatedEquipment);
      return updatedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    equipment, 
    loading, 
    error, 
    updateEquipment: handleUpdate,
    checkoutEquipment: handleCheckout,
    checkinEquipment: handleCheckin
  };
};

export const useCreateEquipment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCreate = async (equipmentData: Omit<Equipment, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const newEquipment = await createEquipment(equipmentData);
      setError(null);
      return newEquipment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createEquipment: handleCreate, loading, error };
}; 