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
  allow_custom_answers?: boolean;
  user_answer?: {
    option: number;
    comment: string;
    custom_answer?: string;
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
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>({});
  const [userCustomOptions, setUserCustomOptions] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [newPoll, setNewPoll] = useState({
    id: undefined as number | undefined,
    target_audience: '',
    question: '',
    options: ['', '', '', '', '', '', '', '', '', ''],
    allow_custom_answers: false
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
      const response = await fetch(`${API_URL}?user_fingerprint=${userFingerprint}`);
      const data = await response.json();
      if (data.polls && data.polls.length > 0) {
        const sortedPolls = sortPolls(data.polls, 'newest');
        
        const detailedPolls = await Promise.all(
          sortedPolls.map(async (poll) => {
            const detailResponse = await fetch(`${API_URL}?poll_id=${poll.id}&user_fingerprint=${userFingerprint}`);
            return await detailResponse.json();
          })
        );
        
        setPolls(detailedPolls);
        
        // Инициализация пользовательских вариантов для опросов с allow_custom_answers
        const initialUserOptions: Record<number, string[]> = {};
        detailedPolls.forEach(poll => {
          if (poll.allow_custom_answers) {
            initialUserOptions[poll.id] = ['', '', '', '', '', '', '', '', '', ''];
            console.log('Инициализация userCustomOptions для опроса', poll.id);
          }
        });
        console.log('Final initialUserOptions:', initialUserOptions);
        setUserCustomOptions(initialUserOptions);
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
      return b.id - a.id;
    });
  };

  const handleUserCustomOptionChange = (pollId: number) => (index: number, value: string) => {
    setUserCustomOptions(prev => {
      const currentOptions = prev[pollId] || [];
      const newOptions = currentOptions.map((opt, i) => i === index ? value : opt);
      return {
        ...prev,
        [pollId]: newOptions
      };
    });
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



  const handleVote = async (pollId: number) => {
    const poll = polls.find(p => p.id === pollId);
    const selectedOption = selectedOptions[pollId];
    const comment = comments[pollId] || '';
    const customAnswer = customAnswers[pollId] || '';
    const customOptions = userCustomOptions[pollId] || [];
    
    console.log('🎯 handleVote called:', { pollId, selectedOption, customOptions, allowCustom: poll?.allow_custom_answers });
    
    if (poll?.allow_custom_answers) {
      const filledOptions = customOptions.filter(opt => opt.trim() !== '');
      console.log('🎯 Custom answers mode, filled options:', filledOptions);
      if (filledOptions.length === 0) {
        toast({
          title: 'Заполните варианты',
          description: 'Пожалуйста, заполните хотя бы один вариант ответа',
          variant: 'destructive'
        });
        return;
      }
    } else {
      if (!selectedOption) {
        toast({
          title: 'Выберите вариант',
          description: 'Пожалуйста, выберите один из вариантов ответа',
          variant: 'destructive'
        });
        return;
      }
    }

    const payload = {
      action: 'vote',
      poll_id: pollId,
      user_fingerprint: userFingerprint,
      selected_option: selectedOption || null,
      comment: comment,
      custom_answer: customAnswer,
      user_custom_options: poll?.allow_custom_answers ? customOptions.filter(opt => opt.trim() !== '') : []
    };
    
    console.log('🚀 Sending vote payload:', payload);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
        
        const updatedPolls = await Promise.all(
          polls.map(async (poll) => {
            if (poll.id === pollId) {
              const detailResponse = await fetch(`${API_URL}?poll_id=${poll.id}&user_fingerprint=${userFingerprint}`);
              return await detailResponse.json();
            }
            return poll;
          })
        );
        setPolls(updatedPolls);
        
        setSelectedOptions(prev => ({ ...prev, [pollId]: null }));
        setComments(prev => ({ ...prev, [pollId]: '' }));
        setCustomAnswers(prev => ({ ...prev, [pollId]: '' }));
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
    const filledOptions = newPoll.options.filter(opt => opt.trim() !== '').map(opt => opt.slice(0, 30));
    if (!newPoll.question) {
      toast({
        title: 'Заполните поле',
        description: 'Вопрос обязателен',
        variant: 'destructive'
      });
      return;
    }
    
    if (!newPoll.allow_custom_answers && filledOptions.length < 2) {
      toast({
        title: 'Заполните варианты',
        description: 'Минимум 2 варианта ответов обязательны',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        action: 'create',
        target_audience: newPoll.target_audience.slice(0, 30),
        question: newPoll.question.slice(0, 100),
        options: filledOptions,
        allow_custom_answers: newPoll.allow_custom_answers
      };
      
      console.log('Creating poll with payload:', payload);
      console.log('Total filled options:', filledOptions.length);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast({
          title: 'Опрос создан!',
          description: 'Новый опрос успешно добавлен'
        });
        
        // Инициализация userCustomOptions для нового опроса
        if (data.poll_id && newPoll.allow_custom_answers) {
          setUserCustomOptions(prev => ({
            ...prev,
            [data.poll_id]: ['', '', '', '', '', '', '', '', '', '']
          }));
        }
        
        setNewPoll({
          id: undefined,
          target_audience: '',
          question: '',
          options: ['', '', '', '', '', '', '', '', '', ''],
          allow_custom_answers: false
        });
        setShowAdmin(false);
        fetchPolls();
      } else {
        console.error('Create poll failed:', data);
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать опрос',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Create poll error:', error);
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
    const paddedOptions = [...poll.options];
    while (paddedOptions.length < 10) {
      paddedOptions.push('');
    }
    setNewPoll({
      id: poll.id,
      target_audience: poll.target_audience,
      question: poll.question,
      options: paddedOptions.slice(0, 10),
      allow_custom_answers: poll.allow_custom_answers || false
    });
    setEditMode(true);
    setShowAdmin(true);
  };

  const handleUpdatePoll = async () => {
    const filledOptions = newPoll.options.filter(opt => opt.trim() !== '').map(opt => opt.slice(0, 30));
    if (!newPoll.question || !newPoll.id) {
      toast({
        title: 'Заполните поле',
        description: 'Вопрос обязателен',
        variant: 'destructive'
      });
      return;
    }
    
    if (!newPoll.allow_custom_answers && filledOptions.length < 2) {
      toast({
        title: 'Заполните варианты',
        description: 'Минимум 2 варианта ответов обязательны',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        action: 'update',
        poll_id: newPoll.id,
        target_audience: newPoll.target_audience.slice(0, 30),
        question: newPoll.question.slice(0, 100),
        options: filledOptions,
        allow_custom_answers: newPoll.allow_custom_answers
      };
      
      console.log('Sending update:', payload);
      console.log('Total filled options:', filledOptions.length);
      
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
          options: ['', '', '', '', '', '', '', '', '', ''],
          allow_custom_answers: false
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
          options: ['', '', '', '', '', '', '', '', '', ''],
          allow_custom_answers: false
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
      options: ['', '', '', '', '', '', '', '', '', ''],
      allow_custom_answers: false
    });
    setEditMode(false);
    setShowAdmin(false);
  };

  const handleExport = (pollId: number, format: 'pdf' | 'excel') => {
    const url = `${EXPORT_URL}?poll_id=${pollId}&format=${format}`;
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

        <div className="max-w-7xl mx-auto space-y-8">
          {polls.map((poll) => (
            <div key={poll.id}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <PollCard
                    poll={poll}
                    selectedOption={selectedOptions[poll.id] || null}
                    comment={comments[poll.id] || ''}
                    customAnswer={customAnswers[poll.id] || ''}
                    userCustomOptions={userCustomOptions[poll.id] || ['', '', '', '', '', '', '', '', '', '']}
                    onSelectOption={(option) => setSelectedOptions(prev => ({ ...prev, [poll.id]: option }))}
                    onCommentChange={(comment) => setComments(prev => ({ ...prev, [poll.id]: comment }))}
                    onCustomAnswerChange={(answer) => setCustomAnswers(prev => ({ ...prev, [poll.id]: answer }))}
                    onUserCustomOptionChange={handleUserCustomOptionChange(poll.id)}
                    onVote={() => handleVote(poll.id)}
                  />
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => handleEditPoll(poll)}
                    >
                      <Icon name="Edit" size={18} />
                      Редактировать опрос
                    </Button>
                  )}
                </div>
                <div>
                  <StatisticsPanel 
                    poll={poll} 
                    onExport={(format) => handleExport(poll.id, format)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

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