import { cn } from '../utils/cn';

const Input = ({ label, className, error, ...props }) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>}
            <input
                className={cn(
                    "w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
};

export default Input;
