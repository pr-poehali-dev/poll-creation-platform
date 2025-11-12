import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = 'https://functions.poehali.dev/dd334e11-802b-4eba-9f77-b038f347f2b3';

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
  const [newPoll, setNewPoll] = useState({
    target_audience: '',
    question: '',
    options: ['', '', '', '', '']
  });
  const { toast } = useToast();
  const userFingerprint = getUserFingerprint();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.polls && data.polls.length > 0) {
        setPolls(data.polls);
        fetchPollDetails(data.polls[0].id);
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
    }
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

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Публичные Опросы
              </h1>
              <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Ваше мнение важно для общества
              </p>
            </div>
            <Button
              variant={showAdmin ? "default" : "outline"}
              onClick={() => setShowAdmin(!showAdmin)}
              className="gap-2"
            >
              <Icon name={showAdmin ? "X" : "Plus"} size={18} />
              {showAdmin ? 'Закрыть' : 'Создать опрос'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {showAdmin && (
          <Card className="mb-8 border-2 border-accent/20 animate-in fade-in slide-in-from-top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={24} />
                Администрирование
              </CardTitle>
              <CardDescription>Создайте новый опрос для сообщества</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target">Кому предназначен (до 30 символов)</Label>
                <Input
                  id="target"
                  placeholder="Например: Всем гражданам"
                  maxLength={30}
                  value={newPoll.target_audience}
                  onChange={(e) => setNewPoll({ ...newPoll, target_audience: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="question">Вопрос (до 50 символов)</Label>
                <Input
                  id="question"
                  placeholder="Введите вопрос опроса"
                  maxLength={50}
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Варианты ответов</Label>
                {newPoll.options.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Вариант ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                  />
                ))}
              </div>
              <Button onClick={handleCreatePoll} className="w-full gap-2">
                <Icon name="Check" size={18} />
                Создать опрос
              </Button>
            </CardContent>
          </Card>
        )}

        {currentPoll && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Icon name="Users" size={16} />
                    {currentPoll.target_audience}
                  </div>
                  <CardTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {currentPoll.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {!currentPoll.user_voted ? (
                    <>
                      <div className="space-y-3">
                        {currentPoll.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedOption === index + 1 ? "default" : "outline"}
                            className="w-full justify-start text-left h-auto py-4 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            onClick={() => setSelectedOption(index + 1)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedOption === index + 1 
                                  ? 'bg-accent border-accent' 
                                  : 'border-muted-foreground'
                              }`}>
                                {selectedOption === index + 1 && (
                                  <Icon name="Check" size={14} className="text-accent-foreground" />
                                )}
                              </div>
                              <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{option}</span>
                            </div>
                          </Button>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Label htmlFor="comment" className="text-sm text-muted-foreground">
                          Комментарий (необязательно, до 100 символов)
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Поделитесь своим мнением..."
                          maxLength={100}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="mt-2 resize-none"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {comment.length}/100
                        </p>
                      </div>

                      <Button 
                        onClick={handleVote} 
                        className="w-full gap-2 py-6 text-lg"
                        disabled={!selectedOption}
                      >
                        <Icon name="Send" size={20} />
                        Отправить голос
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name="CheckCircle2" size={24} className="text-accent mt-1" />
                          <div>
                            <p className="font-semibold text-foreground">Вы уже проголосовали</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ваш выбор: <strong>{currentPoll.options[currentPoll.user_answer!.option - 1]}</strong>
                            </p>
                            {currentPoll.user_answer?.comment && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                "{currentPoll.user_answer.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {currentPoll.user_voted && currentPoll.statistics && (
              <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="border-2 border-accent/20 sticky top-4">
                  <CardHeader className="bg-accent/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon name="BarChart3" size={20} />
                      Статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Icon name="Users" size={24} className="mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold text-foreground">{currentPoll.total_responses || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Всего ответов</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Icon name="TrendingUp" size={24} className="mx-auto text-accent mb-2" />
                        <p className="text-2xl font-bold text-foreground">
                          {currentPoll.statistics.reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Голосов подано</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground">Распределение голосов</h4>
                      {currentPoll.options.map((option, index) => {
                        const count = currentPoll.statistics![index];
                        const total = currentPoll.statistics!.reduce((a, b) => a + b, 0);
                        const percentage = getPercentage(count, total);
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground truncate max-w-[180px]" title={option}>
                                {option}
                              </span>
                              <span className="font-semibold text-primary">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {count} {count === 1 ? 'голос' : count < 5 ? 'голоса' : 'голосов'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {polls.length > 1 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Другие опросы</h3>
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
                      <CardTitle className="text-base">{poll.question}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
            </div>
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
