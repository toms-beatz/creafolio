import * as React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export function Label({ children, required, className = '', ...props }: LabelProps) {
    return (
        <label
            className={['block text-sm font-medium text-zinc-300', className].join(' ')}
            {...props}
        >
            {children}
            {required && (
                <>
                    <span className="ml-1 text-sky-400/70" aria-hidden="true">*</span>
                    <span className="sr-only"> (obligatoire)</span>
                </>
            )}
        </label>
    );
}
