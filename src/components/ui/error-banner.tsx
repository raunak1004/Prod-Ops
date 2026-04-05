import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './card';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <Card className="border-red-300 bg-red-50">
      <CardContent className="p-4 text-sm text-red-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Some data failed to load</div>
            <div>{message}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
