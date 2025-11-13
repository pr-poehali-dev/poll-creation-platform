import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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

interface PollCardProps {
  poll: Poll;
  selectedOption: number | null;
  comment: string;
  customAnswer: string;
  userCustomOptions: string[];
  onSelectOption: (option: number) => void;
  onCommentChange: (comment: string) => void;
  onCustomAnswerChange: (answer: string) => void;
  onUserCustomOptionChange: (index: number, value: string) => void;
  onVote: () => void;
}

export default function PollCard({ 
  poll, 
  selectedOption, 
  comment, 
  customAnswer, 
  userCustomOptions, 
  onSelectOption, 
  onCommentChange, 
  onCustomAnswerChange,
  onUserCustomOptionChange, 
  onVote 
}: PollCardProps) {
  const isButtonDisabled = poll.allow_custom_answers ? userCustomOptions.every(opt => opt.trim() === '') : !selectedOption;
  console.log(`Poll #${poll.id}: allow_custom=${poll.allow_custom_answers}, disabled=${isButtonDisabled}, userCustomOptions=`, userCustomOptions);
  
  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Icon name="Users" size={16} />
          {poll.target_audience}
        </div>
        <CardTitle 
          className={`text-2xl ${!poll.user_voted ? 'text-green-600' : ''}`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {poll.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!poll.user_voted ? (
          <>
            {poll.allow_custom_answers ? (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Введите свои варианты ответов (до 30 символов каждый)</Label>
                {userCustomOptions.map((option, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Вариант {index + 1}</span>
                      <span className={`text-xs font-medium ${
                        option.length > 27 
                          ? 'text-destructive' 
                          : option.length > 24 
                          ? 'text-orange-500' 
                          : 'text-muted-foreground'
                      }`}>
                        {option.length}/30
                      </span>
                    </div>
                    <Input
                      placeholder={`Введите вариант ${index + 1}`}
                      maxLength={30}
                      value={option}
                      onChange={(e) => {
                        console.log('Изменение поля', index, 'новое значение:', e.target.value);
                        onUserCustomOptionChange(index, e.target.value);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              poll.options.filter(opt => opt.trim() !== '').length > 0 && (
                <div className="space-y-3">
                  {poll.options
                    .map((option, index) => ({ option, originalIndex: index }))
                    .filter(item => item.option.trim() !== '')
                    .map((item, displayIndex) => (
                      <Button
                        key={item.originalIndex}
                        variant={selectedOption === item.originalIndex + 1 ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto py-4 px-6 animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${displayIndex * 100}ms` }}
                        onClick={() => {
                          console.log('Выбран вариант:', item.originalIndex + 1, 'Текст:', item.option);
                          onSelectOption(item.originalIndex + 1);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedOption === item.originalIndex + 1 
                              ? 'bg-accent border-accent' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedOption === item.originalIndex + 1 && (
                              <Icon name="Check" size={14} className="text-accent-foreground" />
                            )}
                          </div>
                          <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{item.option}</span>
                        </div>
                      </Button>
                    ))}
                </div>
              )
            )}

            <div className="pt-4">
              <Label htmlFor="comment" className="text-sm text-muted-foreground">
                Комментарий (необязательно, до 100 символов)
              </Label>
              <Textarea
                id="comment"
                placeholder="Поделитесь своим мнением..."
                maxLength={100}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                className="mt-2 resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {comment.length}/100
              </p>
            </div>

            <Button 
              onClick={onVote} 
              className="w-full gap-2 py-6 text-lg"
              disabled={isButtonDisabled}
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
                  {poll.user_answer?.custom_answer ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ваш ответ: <strong>{poll.user_answer.custom_answer}</strong>
                    </p>
                  ) : poll.user_answer?.option ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ваш выбор: <strong>{poll.options[poll.user_answer.option - 1]}</strong>
                    </p>
                  ) : null}
                  {poll.user_answer?.comment && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{poll.user_answer.comment}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}