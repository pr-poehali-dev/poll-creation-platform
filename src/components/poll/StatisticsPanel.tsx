import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface StatisticsPanelProps {
  poll: Poll;
  onExport: (format: 'pdf' | 'excel') => void;
}

export default function StatisticsPanel({ poll, onExport }: StatisticsPanelProps) {
  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (!poll.user_voted || !poll.statistics) {
    return null;
  }

  return (
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
              <p className="text-2xl font-bold text-foreground">{poll.total_responses || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Всего ответов</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Icon name="TrendingUp" size={24} className="mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {poll.statistics.reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Голосов подано</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex-1 gap-2"
            >
              <Icon name="FileText" size={16} />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              className="flex-1 gap-2"
            >
              <Icon name="FileSpreadsheet" size={16} />
              Excel
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Распределение голосов</h4>
            {poll.options.map((option, index) => {
              const count = poll.statistics![index];
              const total = poll.statistics!.reduce((a, b) => a + b, 0);
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
  );
}
