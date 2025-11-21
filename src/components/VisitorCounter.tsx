import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/dd334e11-802b-4eba-9f77-b038f347f2b3';

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitorCount();
  }, []);

  const fetchVisitorCount = async () => {
    try {
      const response = await fetch(`${API_URL}?get_visitor_count=true`);
      const data = await response.json();
      setVisitorCount(data.visitor_count || 0);
    } catch (error) {
      console.error('Failed to fetch visitor count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full mb-3"
      disabled
    >
      <Icon name="Users" className="mr-2 h-4 w-4" />
      {loading ? 'Загрузка...' : `Посетителей: ${visitorCount}`}
    </Button>
  );
}
