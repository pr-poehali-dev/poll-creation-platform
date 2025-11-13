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
      <CardHeader className="bg-accent/5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="BarChart3" size={16} />
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <Icon name="Users" size={18} className="mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{poll.total_responses || 0}</p>
            <p className="text-[10px] text-muted-foreground">Ответов</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <Icon name="TrendingUp" size={18} className="mx-auto text-accent mb-1" />
            <p className="text-lg font-bold text-foreground">
              {poll.statistics.reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Голосов</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Фильтр по датам</Label>
            <div className="flex gap-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="От"
                className="text-xs h-8"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="До"
                className="text-xs h-8"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyDateFilter}
                className="flex-1 gap-1 h-7 text-xs"
                disabled={!dateFrom || !dateTo}
              >
                <Icon name="Filter" size={12} />
                Применить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDateFilter}
                className="gap-1 h-7 text-xs"
                disabled={!dateFrom && !dateTo}
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <Icon name="FileText" size={14} />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-xs text-muted-foreground">Распределение голосов</h4>
          {poll.options.map((option, index) => {
            const count = poll.statistics![index];
            const total = poll.statistics!.reduce((a, b) => a + b, 0);
            const percentage = getPercentage(count, total);
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate max-w-[140px]" title={option}>
                    {option}
                  </span>
                  <span className="font-semibold text-primary text-xs">{percentage}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
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