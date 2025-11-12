import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PollHeaderProps {
  showAdmin: boolean;
  onToggleAdmin: () => void;
}

export default function PollHeader({ showAdmin, onToggleAdmin }: PollHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>Мне интересно</h1>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>Ваше мнение важно для меня лично и, надеюсь, что для некоторой части общества тоже</p>
          </div>
          <Button
            variant={showAdmin ? "default" : "outline"}
            onClick={onToggleAdmin}
            className="gap-2"
          >
            <Icon name={showAdmin ? "X" : "Plus"} size={18} />
            {showAdmin ? 'Закрыть' : 'Создать опрос'}
          </Button>
        </div>
      </div>
    </header>
  );
}
