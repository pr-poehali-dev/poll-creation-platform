import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ComparisonItem {
  name: string;
  url: string;
  votes: number;
}

interface ComparisonCardProps {
  comparison: {
    id: number;
    contentType: string;
    items: ComparisonItem[];
    totalVotes: number;
    userVoted?: boolean;
  };
  onVote: (itemIndex: number) => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export default function ComparisonCard({ comparison, onVote, onDelete, isAdmin }: ComparisonCardProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'song': return 'Music';
      case 'image': return 'Image';
      case 'text': return 'FileText';
      case 'product': return 'ShoppingCart';
      case 'video': return 'Video';
      default: return 'GitCompare';
    }
  };

  const getContentLabel = (type: string) => {
    switch (type) {
      case 'song': return 'Песня';
      case 'image': return 'Изображение';
      case 'text': return 'Текст';
      case 'product': return 'Товар';
      case 'video': return 'Клип';
      default: return 'Сравнение';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name={getContentIcon(comparison.contentType) as any} size={20} />
            Сравнение: {getContentLabel(comparison.contentType)}
          </CardTitle>
          {isAdmin && onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
              <Icon name="Trash2" size={16} />
              Удалить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Всего голосов: {comparison.totalVotes}
        </div>

        <div className="space-y-3">
          {comparison.items.map((item, index) => {
            const percentage = comparison.totalVotes > 0 
              ? Math.round((item.votes / comparison.totalVotes) * 100) 
              : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Icon name="ExternalLink" size={12} />
                        Открыть
                      </a>
                    )}
                  </div>
                  {!comparison.userVoted && (
                    <Button 
                      size="sm" 
                      onClick={() => onVote(index)}
                      className="gap-2"
                    >
                      <Icon name="ThumbsUp" size={16} />
                      Выбрать
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {item.votes} голосов ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {comparison.userVoted && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-center">
            <Icon name="Check" size={16} className="inline mr-2" />
            Вы уже проголосовали в этом сравнении
          </div>
        )}
      </CardContent>
    </Card>
  );
}
