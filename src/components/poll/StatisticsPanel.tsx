import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const handleApplyDateFilter = () => {
    console.log('Фильтр по датам:', dateFrom, dateTo);
  };

  const handleResetDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  if (!poll.user_voted || !poll.statistics) {
    return null;
  }

  return (
    <Card className="border-2 border-accent/20 h-fit">
      <CardHeader className="bg-accent/5 py-2 px-4">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <Icon name="BarChart3" size={14} />
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-4 px-4 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="text-center p-1.5 bg-muted/30 rounded">
            <Icon name="Users" size={14} className="mx-auto text-primary mb-0.5" />
            <p className="text-sm font-bold text-foreground">{poll.total_responses || 0}</p>
            <p className="text-[9px] text-muted-foreground">Ответов</p>
          </div>
          <div className="text-center p-1.5 bg-muted/30 rounded">
            <Icon name="TrendingUp" size={14} className="mx-auto text-accent mb-0.5" />
            <p className="text-sm font-bold text-foreground">
              {poll.statistics.reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-[9px] text-muted-foreground">Голосов</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Фильтр по датам</Label>
            <div className="flex gap-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="От"
                className="text-[10px] h-7 px-2"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="До"
                className="text-[10px] h-7 px-2"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyDateFilter}
                className="flex-1 gap-1 h-6 text-[10px] px-2"
                disabled={!dateFrom || !dateTo}
              >
                <Icon name="Filter" size={10} />
                Применить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDateFilter}
                className="gap-1 h-6 text-[10px] px-2"
                disabled={!dateFrom && !dateTo}
              >
                <Icon name="X" size={10} />
              </Button>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex-1 gap-1 h-7 text-[10px] px-2"
            >
              <Icon name="FileText" size={12} />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              className="flex-1 gap-1 h-7 text-[10px] px-2"
            >
              <Icon name="FileSpreadsheet" size={12} />
              Excel
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-[10px] text-muted-foreground">Распределение голосов</h4>
          {poll.options.map((option, index) => {
            const count = poll.statistics![index];
            const total = poll.statistics!.reduce((a, b) => a + b, 0);
            const percentage = getPercentage(count, total);
            
            return (
              <div key={index} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-foreground truncate max-w-[120px]" title={option}>
                    {option}
                  </span>
                  <span className="font-semibold text-primary">{percentage}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[8px] text-muted-foreground">
                  {count} {count === 1 ? 'голос' : count < 5 ? 'голоса' : 'голосов'}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}