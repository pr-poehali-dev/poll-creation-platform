import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PollHeaderProps {
  showAdmin: boolean;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
}

export default function PollHeader({ showAdmin, isAdmin, onToggleAdmin, onAdminLogin, onAdminLogout }: PollHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>Мне интересно</h1>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Open Sans, sans-serif' }}>Ваше мнение важно для меня лично и, надеюсь, для некоторой части общества тоже</p>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <Button
                  variant={showAdmin ? "default" : "outline"}
                  onClick={onToggleAdmin}
                  className="gap-2"
                >
                  <Icon name={showAdmin ? "X" : "Plus"} size={18} />
                  {showAdmin ? 'Закрыть' : 'Создать опрос'}
                </Button>
                <Button
                  variant="outline"
                  onClick={onAdminLogout}
                  className="gap-2"
                >
                  <Icon name="LogOut" size={18} />
                  Выйти
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={onAdminLogin}
                className="gap-2"
              >
                <Icon name="Lock" size={18} />
                Админ
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}