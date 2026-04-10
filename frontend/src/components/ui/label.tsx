import * as React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export function Label({ children, required, className = '', ...props }: LabelProps) {
    return (
        <label
            className={['block text-sm font-medium text-[#1a1a1a]/80', className].join(' ')}
            {...props}
        >
            {children}
            {required && (
                <>
                    <span className="ml-1 text-[#ad7b60]/70" aria-hidden="true">*</span>
                    <span className="sr-only"> (obligatoire)</span>
                </>
            )}
        </label>
    );
}
