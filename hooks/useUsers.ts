import { useState, useEffect } from 'react';
import { 
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByCardId,
  createUser,
  updateUser,
  grantAccess,
  revokeAccess,
  getUserEquipment,
  User
} from '../utils/userService';
import { Equipment } from '../utils/equipmentService';

export const useUsersList = (filters?: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(filters);
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  return { users, loading, error };
};

export const useUserItem = (id?: number, email?: string, cardId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id && !email && !cardId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let data;
        
        if (id) {
          data = await getUserById(id);
        } else if (email) {
          data = await getUserByEmail(email);
        } else if (cardId) {
          data = await getUserByCardId(cardId);
        }
        
        setUser(data || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, email, cardId]);

  const handleUpdate = async (updates: Partial<User>) => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      const updatedUser = await updateUser(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      const updatedUser = await grantAccess(user.id);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      const updatedUser = await revokeAccess(user.id);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    error, 
    updateUser: handleUpdate,
    grantAccess: handleGrantAccess,
    revokeAccess: handleRevokeAccess
  };
};

export const useUserEquipment = (userId?: number) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserEquipment(userId);
        setEquipment(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [userId]);

  return { equipment, loading, error };
};

export const useCreateUser = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCreate = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const newUser = await createUser(userData);
      setError(null);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createUser: handleCreate, loading, error };
}; 