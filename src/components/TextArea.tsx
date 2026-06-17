import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  currentLength?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, maxLength, currentLength, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          className={cn(
            "w-full glass-panel rounded-xl p-4 text-tp-primary bg-tp-surface/50 resize-none focus:outline-none focus:ring-2 focus:ring-tp-blue/50 transition-all placeholder:text-tp-secondary/50",
            className
          )}
          {...props}
        />
        {maxLength !== undefined && currentLength !== undefined && (
          <div className="text-right text-sm text-tp-secondary">
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export default TextArea;
