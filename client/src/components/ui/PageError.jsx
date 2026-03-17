import { AlertCircle, RotateCcw } from 'lucide-react';
import { getErrorMessage } from '../../utils/helpers.js';

const PageError = ({ error, onRetry, title = 'Failed to load data' }) => {
  const message = getErrorMessage(error);
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-pink/10 border border-pink/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-pink" />
      </div>
      <h3 className="text-display text-2xl text-white tracking-[2px] mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-xs mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-lime text-lime font-bold uppercase text-xs tracking-[1px] hover:bg-lime hover:text-ink transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default PageError;
