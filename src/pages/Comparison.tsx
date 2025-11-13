import { useState } from 'react';
import PollHeader from '@/components/poll/PollHeader';
import ComparisonUpload from '@/components/comparison/ComparisonUpload';
import ComparisonStatistics from '@/components/comparison/ComparisonStatistics';
import { useToast } from '@/hooks/use-toast';

export default function Comparison() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const [mockComparison] = useState({
    id: 1,
    title: 'Какая песня лучше?',
    description: 'Выберите вашу любимую песню из этих трёх',
    contentType: 'song',
    items: [
      { name: 'Песня А', url: 'https://example.com/song-a', votes: 45 },
      { name: 'Песня Б', url: 'https://example.com/song-b', votes: 30 },
      { name: 'Песня В', url: 'https://example.com/song-c', votes: 25 }
    ],
    totalVotes: 100,
    userVoted: true
  });

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowAdmin(false);
  };

  const handleSubmit = (data: any) => {
    console.log('Создание сравнения:', data);
    toast({
      title: 'Сравнение создано!',
      description: 'Ваше сравнение успешно сохранено'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PollHeader 
        showAdmin={showAdmin}
        isAdmin={isAdmin}
        onToggleAdmin={() => isAdmin && setShowAdmin(!showAdmin)}
        onAdminLogin={() => setShowAdminLogin(true)}
        onAdminLogout={handleAdminLogout}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ComparisonUpload onSubmit={handleSubmit} />
            </div>
            <div>
              <ComparisonStatistics data={mockComparison} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}