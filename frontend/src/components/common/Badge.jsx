import React from 'react';
export const Badge = ({ children, variant = 'primary', size = 'md', className = '', icon, }) => {
    const variantStyles = {
        primary: 'bg-lavender-100 text-lavender-700 border border-lavender-300',
        secondary: 'bg-electric-500/10 text-electric-600 border border-electric-500/20',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-750 text-amber-800 border border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border border-rose-200',
        neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
    const sizeStyles = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs font-medium px-2.5 py-1',
    };
    return (<span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="inline-block flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>);
};
