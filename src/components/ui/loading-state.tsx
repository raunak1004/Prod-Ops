import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './card';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
      <Card className="w-64">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
          <span>{message}</span>
        </CardContent>
      </Card>
    </div>
  );
}
