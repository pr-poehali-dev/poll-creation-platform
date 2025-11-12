import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  newPoll: {
    id?: number;
    target_audience: string;
    question: string;
    options: string[];
  };
  editMode: boolean;
  onUpdatePoll: (poll: { id?: number; target_audience: string; question: string; options: string[] }) => void;
  onCreatePoll: () => void;
  onUpdateExisting?: () => void;
  onCancelEdit?: () => void;
  onDeletePoll?: () => void;
}

export default function AdminPanel({ newPoll, editMode, onUpdatePoll, onCreatePoll, onUpdateExisting, onCancelEdit, onDeletePoll }: AdminPanelProps) {
  return (
    <Card className="mb-8 border-2 border-accent/20 animate-in fade-in slide-in-from-top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name={editMode ? "Edit" : "Settings"} size={24} />
          {editMode ? 'Редактирование опроса' : 'Администрирование'}
        </CardTitle>
        <CardDescription>{editMode ? 'Отредактируйте существующий опрос' : 'Создайте новый опрос для сообщества'}</CardDescription>
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
          <Label htmlFor="question">Вопрос (до 100 символов)</Label>
          <Textarea
            id="question"
            placeholder="Введите вопрос опроса"
            maxLength={100}
            value={newPoll.question}
            onChange={(e) => onUpdatePoll({ ...newPoll, question: e.target.value })}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {newPoll.question.length}/100
          </p>
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
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button onClick={onUpdateExisting} className="flex-1 gap-2">
                <Icon name="Save" size={18} />
                Сохранить изменения
              </Button>
              <Button onClick={onDeletePoll} variant="destructive" className="gap-2">
                <Icon name="Trash2" size={18} />
                Удалить
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="gap-2">
                <Icon name="X" size={18} />
                Отмена
              </Button>
            </>
          ) : (
            <Button onClick={onCreatePoll} className="w-full gap-2">
              <Icon name="Check" size={18} />
              Создать опрос
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}