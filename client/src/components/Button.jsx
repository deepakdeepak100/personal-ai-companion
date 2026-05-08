import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = ({ children, className, variant = 'primary', isLoading, disabled, ...props }) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25",
        secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
    };

    return (
        <button
            className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {children}
        </button>
    );
};

export default Button;
