import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ inline = false, message = "Loading..." }) => {
    if (inline) {
        return (
            <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                {message}
            </span>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] text-slate-500">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="font-bold">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
