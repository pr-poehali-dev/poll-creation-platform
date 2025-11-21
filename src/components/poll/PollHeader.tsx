import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';
import VisitorCounter from '@/components/VisitorCounter';

interface PollHeaderProps {
  showAdmin: boolean;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
}

export default function PollHeader({ showAdmin, isAdmin, onToggleAdmin, onAdminLogin, onAdminLogout }: PollHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    if (location.pathname === '/') {
      onToggleAdmin();
    }
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>Мне интересно</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>Ваше мнение важно для меня лично и, надеюсь, для некоторой части общества тоже</p>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant={location.pathname === '/' ? 'default' : 'outline'}
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Icon name="FileText" size={18} />
                Опросы
              </Button>
              <Button
                variant={location.pathname === '/comparison' ? 'default' : 'outline'}
                onClick={() => navigate('/comparison')}
                className="gap-2"
              >
                <Icon name="GitCompare" size={18} />
                Сравнения
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <VisitorCounter />
            <div className="flex gap-2">
              {location.pathname === '/' && (
                <Button
                  variant={showAdmin ? "default" : "outline"}
                  onClick={handleToggle}
                  className="gap-2"
                >
                  <Icon name={showAdmin ? "X" : "Plus"} size={18} />
                  {showAdmin ? 'Закрыть' : 'Создать опрос'}
                </Button>
              )}
              {isAdmin ? (
                <Button
                  variant="outline"
                  onClick={onAdminLogout}
                  className="gap-2"
                >
                  <Icon name="LogOut" size={18} />
                  Выйти
                </Button>
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
      </div>
    </header>
  );
}