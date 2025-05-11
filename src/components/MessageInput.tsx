import { cn } from '@/lib/utils';
import { ArrowUp, Loader2, SendHorizonal } from 'lucide-react';
import { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const MessageInput = ({
  handleInputChange,
  handleSubmit,
  loading = false,
  isAiThinking,
  message
}: {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isAiThinking: boolean,
  message: string;
}) => {
  // Calculate button disabled state internally
  const isDisabled = loading || !message.trim();
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

  useEffect(() => {
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, message]);

  return (
    <div className="w-full bg-transparent">
      {isAiThinking && (
       <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
       <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 
         bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg backdrop-blur-sm">
         <Loader2 className="w-4 h-4 animate-spin" />
         AI is thinking...
       </div>
     </div>
      )}

      <form
        onSubmit={(e) => {
          if (loading) return;
          e.preventDefault();
          handleSubmit(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        className={cn(
          'mx-4 mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20',
          'flex items-center shadow-lg transition-all duration-200',
          'border border-gray-200 dark:border-gray-700',
          mode === 'multi' ? 'rounded-2xl p-4' : 'rounded-full p-2',
          'max-w-[calc(100%-2rem)]' // Add max-width
        )}
      >
        <TextareaAutosize
          value={message}
          onChange={(e) => handleInputChange(e)}
          onHeightChange={(height, props) => {
            setTextareaRows(Math.ceil(height / props.rowHeight));
          }}
          className={cn(
            "transition-all duration-200 bg-transparent",
            "text-base text-gray-700 dark:text-gray-200",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "resize-none focus:outline-none w-full px-4",
            "max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink",
          )}
          placeholder="Ask a question..."
        />

        <button
          disabled={message.trim().length === 0 || loading}
          className={cn(
            "flex items-center justify-center",
            "w-10 h-10 rounded-full transition-all duration-200",
            "bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700",
            "text-white disabled:text-gray-400 dark:disabled:text-gray-500",
            "transform hover:scale-105 active:scale-95",
            "disabled:hover:scale-100 disabled:cursor-not-allowed"
          )}
          type="submit"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizonal className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;