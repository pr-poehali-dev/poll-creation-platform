import { useState, useEffect } from 'react';
import PollHeader from '@/components/poll/PollHeader';
import ComparisonUpload from '@/components/comparison/ComparisonUpload';
import ComparisonStatistics from '@/components/comparison/ComparisonStatistics';
import { useToast } from '@/hooks/use-toast';
import { setAdminAuth, isAdminAuthenticated } from '@/utils/adminAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

export default function Comparison() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAdmin(true);
    }
  }, []);

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

  const handleAdminLogin = () => {
    const correctPassword = 'admin2024';
    if (adminPassword === correctPassword) {
      setIsAdmin(true);
      setAdminAuth(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      toast({
        title: 'Вход выполнен',
        description: 'Режим администратора активирован'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminAuth(false);
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
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdminLogin(false)}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Lock" size={24} />
                  Вход для администратора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Введите пароль"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdminLogin} className="flex-1 gap-2">
                    <Icon name="Check" size={18} />
                    Войти
                  </Button>
                  <Button onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }} variant="outline" className="gap-2">
                    <Icon name="X" size={18} />
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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