import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ error, className = '', ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                <input
                    ref={ref}
                    className={[
                        'h-10 w-full rounded-lg border bg-zinc-900 px-3 text-sm text-white',
                        'placeholder:text-zinc-600 outline-none transition-colors',
                        'focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50',
                        error
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
                            : 'border-zinc-700 hover:border-zinc-600',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                        className,
                    ].join(' ')}
                    aria-invalid={error ? 'true' : undefined}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-400" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
