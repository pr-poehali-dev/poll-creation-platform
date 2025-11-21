import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

type ContentType = 'song' | 'image' | 'text' | 'product' | 'video';

interface ComparisonUploadProps {
  onSubmit: (data: any) => void;
}

export default function ComparisonUpload({ onSubmit }: ComparisonUploadProps) {
  const [contentType, setContentType] = useState<ContentType>('song');
  const [items, setItems] = useState<Array<{ name: string; url: string }}>([
    { name: '', url: '' },
    { name: '', url: '' }
  ]);

  const contentTypes = [
    { value: 'song', label: 'Песня', icon: 'Music' },
    { value: 'image', label: 'Изображение', icon: 'Image' },
    { value: 'text', label: 'Текст', icon: 'FileText' },
    { value: 'product', label: 'Товар', icon: 'ShoppingCart' },
    { value: 'video', label: 'Клип', icon: 'Video' }
  ];

  const handleAddItem = () => {
    if (items.length < 10) {
      setItems([...items, { name: '', url: '' }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 2) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'name' | 'url', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    const filledItems = items.filter(item => item.name.trim() !== '' || item.url.trim() !== '');
    
    onSubmit({
      contentType,
      items: filledItems
    });
  };

  const isValid = items.filter(item => item.name.trim() !== '').length >= 2;

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" size={20} />
          Создать сравнение
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label>Тип контента</Label>
          <div className="grid grid-cols-5 gap-2">
            {contentTypes.map((type) => (
              <Button
                key={type.value}
                variant={contentType === type.value ? 'default' : 'outline'}
                onClick={() => setContentType(type.value as ContentType)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Icon name={type.icon as any} size={20} />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Варианты для сравнения (минимум 2, максимум 10)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={items.length >= 10}
              className="gap-2"
            >
              <Icon name="Plus" size={16} />
              Добавить
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder={`Название варианта ${index + 1}`}
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    maxLength={50}
                  />
                  <Input
                    placeholder="URL (ссылка на файл, изображение и т.д.)"
                    value={item.url}
                    onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                    maxLength={500}
                  />
                </div>
                {items.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="mt-2"
                  >
                    <Icon name="X" size={18} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full gap-2 py-6 text-lg"
        >
          <Icon name="GitCompare" size={20} />
          Создать сравнение
        </Button>
      </CardContent>
    </Card>
  );
}