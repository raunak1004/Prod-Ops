import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'bg-gradient-to-r from-indigo-500 to-sky-500',
  'bg-gradient-to-r from-fuchsia-500 to-pink-500',
  'bg-gradient-to-r from-emerald-500 to-teal-500',
  'bg-gradient-to-r from-amber-500 to-orange-500',
  'bg-gradient-to-r from-purple-500 to-violet-500',
  'bg-gradient-to-r from-rose-500 to-red-500',
  'bg-gradient-to-r from-cyan-500 to-blue-500',
  'bg-gradient-to-r from-lime-500 to-green-500',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProjectGradientClass(projectKey: string): string {
  const idx = hashString(projectKey) % GRADIENTS.length;
  return GRADIENTS[idx];
}

interface ProjectTagProps {
  name: string;
  id?: string;
  className?: string;
  size?: 'sm' | 'xs' | 'default';
}

export const ProjectTag: React.FC<ProjectTagProps> = ({ name, id, className, size = 'sm' }) => {
  const gradient = getProjectGradientClass(id || name);
  return (
    <Button
      size={size}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'text-white shadow-sm hover:opacity-90 border-0',
        gradient,
        className,
      )}
    >
      {name}
    </Button>
  );
};

export default ProjectTag;


