import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import PollHeader from '@/components/poll/PollHeader';
import AdminPanel from '@/components/poll/AdminPanel';
import PollCard from '@/components/poll/PollCard';
import StatisticsPanel from '@/components/poll/StatisticsPanel';

const API_URL = 'https://functions.poehali.dev/dd334e11-802b-4eba-9f77-b038f347f2b3';
const EXPORT_URL = 'https://functions.poehali.dev/fe6a3fd2-486b-49d2-bea7-88347a9da3b2';

interface Poll {
  id: number;
  target_audience: string;
  question: string;
  options: string[];
  total_responses?: number;
  user_voted?: boolean;
  statistics?: number[];
  user_answer?: {
    option: number;
    comment: string;
  };
}

const getUserFingerprint = () => {
  let fingerprint = localStorage.getItem('user_fingerprint');
  if (!fingerprint) {
    fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_fingerprint', fingerprint);
  }
  return fingerprint;
};

export default function Index() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [newPoll, setNewPoll] = useState({
    id: undefined as number | undefined,
    target_audience: '',
    question: '',
    options: ['', '', '', '', '']
  });
  const { toast } = useToast();
  const userFingerprint = getUserFingerprint();

  useEffect(() => {
    const savedAdminStatus = localStorage.getItem('isAdmin');
    if (savedAdminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.polls && data.polls.length > 0) {
        const sortedPolls = sortPolls(data.polls, sortOrder);
        setPolls(sortedPolls);
        fetchPollDetails(sortedPolls[0].id);
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить опросы',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const sortPolls = (pollsToSort: Poll[], order: 'newest' | 'oldest') => {
    return [...pollsToSort].sort((a, b) => {
      if (order === 'newest') {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    const sortedPolls = sortPolls(polls, order);
    setPolls(sortedPolls);
    if (sortedPolls.length > 0) {
      fetchPollDetails(sortedPolls[0].id);
    }
  };

  const handleAdminLogin = () => {
    const correctPassword = 'admin2024';
    if (adminPassword === correctPassword) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
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
    localStorage.removeItem('isAdmin');
    setShowAdmin(false);
    setEditMode(false);
    toast({
      title: 'Выход выполнен',
      description: 'Режим администратора отключён'
    });
  };

  const fetchPollDetails = async (pollId: number) => {
    try {
      const response = await fetch(`${API_URL}?poll_id=${pollId}&user_fingerprint=${userFingerprint}`);
      const data = await response.json();
      setCurrentPoll(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить детали опроса',
        variant: 'destructive'
      });
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !currentPoll) {
      toast({
        title: 'Выберите вариант',
        description: 'Пожалуйста, выберите один из вариантов ответа',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'vote',
          poll_id: currentPoll.id,
          user_fingerprint: userFingerprint,
          selected_option: selectedOption,
          comment: comment
        })
      });

      const data = await response.json();

      if (response.status === 409) {
        toast({
          title: 'Вы уже голосовали',
          description: 'Каждый опрос можно пройти только один раз',
          variant: 'destructive'
        });
        return;
      }

      if (data.success) {
        toast({
          title: 'Голос учтён!',
          description: 'Спасибо за участие в опросе'
        });
        fetchPollDetails(currentPoll.id);
        setSelectedOption(null);
        setComment('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить голос',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || newPoll.options.some(opt => !opt)) {
      toast({
        title: 'Заполните все поля',
        description: 'Вопрос и все варианты ответов обязательны',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          target_audience: newPoll.target_audience,
          question: newPoll.question,
          options: newPoll.options
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Опрос создан!',
          description: 'Новый опрос успешно добавлен'
        });
        setNewPoll({
          id: undefined,
          target_audience: '',
          question: '',
          options: ['', '', '', '', '']
        });
        setShowAdmin(false);
        fetchPolls();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать опрос',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPoll = (poll: Poll) => {
    setNewPoll({
      id: poll.id,
      target_audience: poll.target_audience,
      question: poll.question,
      options: [...poll.options]
    });
    setEditMode(true);
    setShowAdmin(true);
  };

  const handleUpdatePoll = async () => {
    if (!newPoll.question || newPoll.options.some(opt => !opt) || !newPoll.id) {
      toast({
        title: 'Заполните все поля',
        description: 'Вопрос и все варианты ответов обязательны',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        action: 'update',
        poll_id: newPoll.id,
        target_audience: newPoll.target_audience,
        question: newPoll.question,
        options: newPoll.options
      };
      
      console.log('Sending update:', payload);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось обновить опрос',
          variant: 'destructive'
        });
        return;
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (data.success) {
        toast({
          title: 'Опрос обновлён!',
          description: 'Изменения успешно сохранены'
        });
        setNewPoll({
          id: undefined,
          target_audience: '',
          question: '',
          options: ['', '', '', '', '']
        });
        setEditMode(false);
        setShowAdmin(false);
        await fetchPolls();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Сервер не подтвердил обновление',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить опрос',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!newPoll.id) return;

    if (!confirm('Вы уверены, что хотите удалить этот опрос?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          poll_id: newPoll.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Опрос удалён',
          description: 'Опрос успешно удалён'
        });
        setNewPoll({
          id: undefined,
          target_audience: '',
          question: '',
          options: ['', '', '', '', '']
        });
        setEditMode(false);
        setShowAdmin(false);
        fetchPolls();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить опрос',
        variant: 'destructive'
      });
    }
  };

  const handleCancelEdit = () => {
    setNewPoll({
      id: undefined,
      target_audience: '',
      question: '',
      options: ['', '', '', '', '']
    });
    setEditMode(false);
    setShowAdmin(false);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!currentPoll) return;
    
    const url = `${EXPORT_URL}?poll_id=${currentPoll.id}&format=${format}`;
    window.open(url, '_blank');
    
    toast({
      title: 'Экспорт запущен',
      description: `Файл ${format.toUpperCase()} скоро начнёт загружаться`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Загрузка опросов...</p>
        </div>
      </div>
    );
  }

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
        {showStatistics && currentPoll && (
          <Button 
            variant="outline" 
            className="mb-4 gap-2"
            onClick={() => setShowStatistics(false)}
          >
            <Icon name="ArrowLeft" size={18} />
            Назад к опросу
          </Button>
        )}

        {showAdmin && (
          <AdminPanel
            newPoll={newPoll}
            editMode={editMode}
            isSaving={isSaving}
            onUpdatePoll={setNewPoll}
            onCreatePoll={handleCreatePoll}
            onUpdateExisting={handleUpdatePoll}
            onDeletePoll={handleDeletePoll}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {currentPoll && !showStatistics && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PollCard
                poll={currentPoll}
                selectedOption={selectedOption}
                comment={comment}
                onSelectOption={setSelectedOption}
                onCommentChange={setComment}
                onVote={handleVote}
              />
              {isAdmin && (
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => handleEditPoll(currentPoll)}
                >
                  <Icon name="Edit" size={18} />
                  Редактировать опрос
                </Button>
              )}
            </div>

            <StatisticsPanel 
              poll={currentPoll} 
              onExport={handleExport} 
            />
          </div>
        )}

        {currentPoll && showStatistics && (
          <div className="max-w-4xl mx-auto">
            <StatisticsPanel 
              poll={currentPoll} 
              onExport={handleExport} 
            />
          </div>
        )}

        {polls.length > 1 && !showStatistics && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Другие опросы</h3>
              <div className="flex gap-2">
                <Button
                  variant={sortOrder === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('newest')}
                  className="gap-2"
                >
                  <Icon name="ArrowDownWideNarrow" size={16} />
                  Новые
                </Button>
                <Button
                  variant={sortOrder === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('oldest')}
                  className="gap-2"
                >
                  <Icon name="ArrowUpWideNarrow" size={16} />
                  Старые
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {polls
                .filter(poll => poll.id !== currentPoll?.id)
                .map(poll => (
                  <Card 
                    key={poll.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => fetchPollDetails(poll.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Icon name="Users" size={14} />
                        {poll.target_audience}
                      </div>
                      <CardTitle 
                        className={`text-base ${!poll.user_voted ? 'text-green-600' : ''}`}
                      >
                        {poll.question}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>
        )}

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
      </main>

      <footer className="border-t mt-16 bg-card">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Публичные опросы помогают формировать общественное мнение
          </p>
        </div>
      </footer>
    </div>
  );
}