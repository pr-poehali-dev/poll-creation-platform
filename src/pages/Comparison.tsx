import { useState, useEffect } from 'react';
import PollHeader from '@/components/poll/PollHeader';
import ComparisonUpload from '@/components/comparison/ComparisonUpload';
import ComparisonCard from '@/components/comparison/ComparisonCard';
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
  const [comparisons, setComparisons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAdmin(true);
    }
    const savedComparisons = localStorage.getItem('comparisons');
    console.log('📦 Loading comparisons from localStorage:', savedComparisons);
    if (savedComparisons) {
      try {
        const parsed = JSON.parse(savedComparisons);
        console.log('✅ Parsed comparisons:', parsed);
        
        // Добавляем isApproved для существующих сравнений (считаем их одобренными)
        const updatedParsed = parsed.map((comp: any) => ({
          ...comp,
          isApproved: comp.isApproved !== undefined ? comp.isApproved : true
        }));
        
        setComparisons(updatedParsed);
        localStorage.setItem('comparisons', JSON.stringify(updatedParsed));
      } catch (error) {
        console.error('❌ Failed to load comparisons:', error);
      }
    } else {
      console.log('⚠️ No saved comparisons found');
    }
  }, []);

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
    console.log('🆕 Creating new comparison:', data);
    const newComparison = {
      id: Date.now(),
      contentType: data.contentType,
      items: data.items.map((item: any) => ({
        name: item.name,
        url: item.url,
        votes: 0
      })),
      totalVotes: 0,
      userVoted: false,
      isApproved: isAdmin
    };

    const updatedComparisons = [newComparison, ...comparisons];
    console.log('💾 Saving comparisons to localStorage:', updatedComparisons);
    setComparisons(updatedComparisons);
    localStorage.setItem('comparisons', JSON.stringify(updatedComparisons));
    
    setShowAdmin(false);
    
    toast({
      title: 'Сравнение создано!',
      description: isAdmin ? 'Ваше сравнение успешно добавлено' : 'Сравнение отправлено на модерацию'
    });
  };

  const handleVote = (comparisonId: number, itemIndex: number) => {
    const updatedComparisons = comparisons.map(comp => {
      if (comp.id === comparisonId && !comp.userVoted) {
        const updatedItems = comp.items.map((item: any, idx: number) => 
          idx === itemIndex ? { ...item, votes: item.votes + 1 } : item
        );
        return {
          ...comp,
          items: updatedItems,
          totalVotes: comp.totalVotes + 1,
          userVoted: true
        };
      }
      return comp;
    });

    setComparisons(updatedComparisons);
    localStorage.setItem('comparisons', JSON.stringify(updatedComparisons));

    toast({
      title: 'Голос учтён!',
      description: 'Спасибо за участие в сравнении'
    });
  };

  const handleDelete = (comparisonId: number) => {
    const updatedComparisons = comparisons.filter(comp => comp.id !== comparisonId);
    setComparisons(updatedComparisons);
    localStorage.setItem('comparisons', JSON.stringify(updatedComparisons));
    toast({
      title: 'Сравнение удалено',
      description: 'Сравнение успешно удалено'
    });
  };

  const handleApprove = (comparisonId: number) => {
    const updatedComparisons = comparisons.map(comp => 
      comp.id === comparisonId ? { ...comp, isApproved: true } : comp
    );
    setComparisons(updatedComparisons);
    localStorage.setItem('comparisons', JSON.stringify(updatedComparisons));
    toast({
      title: 'Сравнение одобрено!',
      description: 'Сравнение теперь видно всем пользователям'
    });
  };

  const handleReject = (comparisonId: number) => {
    if (!confirm('Вы уверены, что хотите отклонить это сравнение? Оно будет удалено.')) return;
    
    const updatedComparisons = comparisons.filter(comp => comp.id !== comparisonId);
    setComparisons(updatedComparisons);
    localStorage.setItem('comparisons', JSON.stringify(updatedComparisons));
    toast({
      title: 'Сравнение отклонено',
      description: 'Сравнение не прошло модерацию и было удалено'
    });
  };

  const visibleComparisons = isAdmin 
    ? comparisons 
    : comparisons.filter(comp => comp.isApproved);

  return (
    <div className="min-h-screen bg-background">
      <PollHeader 
        showAdmin={showAdmin}
        isAdmin={isAdmin}
        onToggleAdmin={() => setShowAdmin(!showAdmin)}
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

        <div className="max-w-7xl mx-auto space-y-8">
          {showAdmin && (
            <div>
              <ComparisonUpload onSubmit={handleSubmit} />
            </div>
          )}

          {visibleComparisons.length > 0 && (
            <div className="space-y-6">
              {visibleComparisons.map((comparison) => (
                <div key={comparison.id}>
                  {isAdmin && !comparison.isApproved && (
                    <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="AlertCircle" size={20} className="text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Сравнение ожидает модерации
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(comparison.id)}
                            className="gap-2"
                          >
                            <Icon name="Check" size={18} />
                            Одобрить
                          </Button>
                          <Button
                            onClick={() => handleReject(comparison.id)}
                            variant="destructive"
                            className="gap-2"
                          >
                            <Icon name="X" size={18} />
                            Не одобряю
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <ComparisonCard
                    comparison={comparison}
                    onVote={(itemIndex) => handleVote(comparison.id, itemIndex)}
                    onDelete={isAdmin ? () => handleDelete(comparison.id) : undefined}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}