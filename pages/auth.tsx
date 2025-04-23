import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Auth() {
  const router = useRouter();
  
  useEffect(() => {
    // Перенаправление на главную страницу
    router.push('/');
  }, [router]);
  
  return null;
} 