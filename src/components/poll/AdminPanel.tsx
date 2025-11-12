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
  isSaving?: boolean;
  onUpdatePoll: (poll: { id?: number; target_audience: string; question: string; options: string[] }) => void;
  onCreatePoll: () => void;
  onUpdateExisting?: () => void;
  onCancelEdit?: () => void;
  onDeletePoll?: () => void;
}

export default function AdminPanel({ newPoll, editMode, isSaving = false, onUpdatePoll, onCreatePoll, onUpdateExisting, onCancelEdit, onDeletePoll }: AdminPanelProps) {
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
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="target">Кому предназначен</Label>
            <span className={`text-xs font-medium ${
              newPoll.target_audience.length > 27 
                ? 'text-destructive' 
                : newPoll.target_audience.length > 24 
                ? 'text-orange-500' 
                : 'text-muted-foreground'
            }`}>
              {newPoll.target_audience.length}/30
            </span>
          </div>
          <Input
            id="target"
            placeholder="Например: Всем гражданам"
            maxLength={30}
            value={newPoll.target_audience}
            onChange={(e) => onUpdatePoll({ ...newPoll, target_audience: e.target.value })}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="question">Вопрос</Label>
            <span className={`text-xs font-medium ${
              newPoll.question.length > 90 
                ? 'text-destructive' 
                : newPoll.question.length > 80 
                ? 'text-orange-500' 
                : 'text-muted-foreground'
            }`}>
              {newPoll.question.length}/100
            </span>
          </div>
          <Textarea
            id="question"
            placeholder="Введите вопрос опроса"
            maxLength={100}
            value={newPoll.question}
            onChange={(e) => onUpdatePoll({ ...newPoll, question: e.target.value })}
            rows={3}
            className="resize-none"
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
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button onClick={onUpdateExisting} className="flex-1 gap-2" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={18} />
                    Сохранить изменения
                  </>
                )}
              </Button>
              <Button onClick={onDeletePoll} variant="destructive" className="gap-2" disabled={isSaving}>
                <Icon name="Trash2" size={18} />
                Удалить
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="gap-2" disabled={isSaving}>
                <Icon name="X" size={18} />
                Отмена
              </Button>
            </>
          ) : (
            <Button onClick={onCreatePoll} className="w-full gap-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  Создать опрос
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}