import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ComparisonItem {
  name: string;
  url: string;
  votes: number;
}

interface ComparisonData {
  id: number;
  title: string;
  description: string;
  contentType: string;
  items: ComparisonItem[];
  totalVotes: number;
  userVoted: boolean;
}

interface ComparisonStatisticsProps {
  data: ComparisonData;
}

export default function ComparisonStatistics({ data }: ComparisonStatisticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPercentage = (votes: number) => {
    if (data.totalVotes === 0) return 0;
    return Math.round((votes / data.totalVotes) * 100);
  };

  if (!data.userVoted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full gap-2 py-6 text-lg animate-in fade-in slide-in-from-top-4"
        variant={isExpanded ? 'default' : 'outline'}
      >
        <Icon name="BarChart3" size={20} />
        {isExpanded ? 'Скрыть статистику' : 'Показать статистику'}
        <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} className="ml-auto" />
      </Button>

      {isExpanded && (
        <Card className="border-2 border-accent/20 h-fit animate-in fade-in slide-in-from-top-4">
          <CardHeader className="bg-accent/5 py-2 px-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Icon name="BarChart3" size={14} />
                Статистика
              </CardTitle>
              <div className="flex items-center gap-3 px-4">
                <Icon name="Users" size={24} className="text-primary" />
                <span className="text-2xl font-bold min-w-[60px]">{data.totalVotes}</span>
                <span className="text-sm text-muted-foreground">Голосов</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-4 px-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-[10px] text-muted-foreground">Распределение голосов</h4>
              {data.items.map((item, index) => {
                const percentage = getPercentage(item.votes);
                
                return (
                  <div key={index} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] gap-2">
                      <span className="text-foreground truncate flex-1" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-semibold text-primary whitespace-nowrap">{percentage}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-muted-foreground">
                      {item.votes} {item.votes === 1 ? 'голос' : item.votes < 5 ? 'голоса' : 'голосов'}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
