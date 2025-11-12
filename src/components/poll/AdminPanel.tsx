import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  newPoll: {
    target_audience: string;
    question: string;
    options: string[];
  };
  onUpdatePoll: (poll: { target_audience: string; question: string; options: string[] }) => void;
  onCreatePoll: () => void;
}

export default function AdminPanel({ newPoll, onUpdatePoll, onCreatePoll }: AdminPanelProps) {
  return (
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
            onChange={(e) => onUpdatePoll({ ...newPoll, target_audience: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="question">Вопрос (до 50 символов)</Label>
          <Input
            id="question"
            placeholder="Введите вопрос опроса"
            maxLength={50}
            value={newPoll.question}
            onChange={(e) => onUpdatePoll({ ...newPoll, question: e.target.value })}
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
                onUpdatePoll({ ...newPoll, options: newOptions });
              }}
            />
          ))}
        </div>
        <Button onClick={onCreatePoll} className="w-full gap-2">
          <Icon name="Check" size={18} />
          Создать опрос
        </Button>
      </CardContent>
    </Card>
  );
}
