import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  onSelectOption: (option: number) => void;
  onCommentChange: (comment: string) => void;
  onCustomAnswerChange: (answer: string) => void;
  onVote: () => void;
}

export default function PollCard({ 
  poll, 
  selectedOption, 
  comment, 
  customAnswer, 
  onSelectOption, 
  onCommentChange, 
  onCustomAnswerChange, 
  onVote 
}: PollCardProps) {
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
            {poll.options.length > 0 && (
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOption === index + 1 ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => onSelectOption(index + 1)}
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
            )}

            {poll.allow_custom_answers && (
              <div className="pt-4">
                <Label htmlFor="customAnswer" className="text-sm text-muted-foreground">
                  Ваш вариант ответа (до 100 символов)
                </Label>
                <Textarea
                  id="customAnswer"
                  placeholder="Введите свой вариант ответа..."
                  maxLength={100}
                  value={customAnswer}
                  onChange={(e) => onCustomAnswerChange(e.target.value)}
                  className="mt-2 resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {customAnswer.length}/100
                </p>
              </div>
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
              disabled={!selectedOption && !customAnswer}
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