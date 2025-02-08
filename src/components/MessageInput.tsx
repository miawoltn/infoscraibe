import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const MessageInput = ({
  handleInputChange,
  handleSubmit,
  loading,
  isAiThinking,
  message
}: {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isAiThinking: boolean,
  message: string;
}) => {
  // const [message, setMessage] = useState('');
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
    <>
    <p className={cn('animate-bounce items-center ml-9 fixed bottom-0 mb-16', {
      "hidden": isAiThinking === false,
    })}> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></p>
    <form
      onSubmit={(e) => {
        if (loading) return;
        e.preventDefault();
        handleSubmit(e)
        // sendMessage(message);
        // setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
          e.preventDefault();
          handleSubmit(e)
          // sendMessage(message);
          // setMessage('');
        }
      }}
      className={cn(
        'fixed bottom-0 right-2 ml-20 bg-background flex items-center w-[65%] overflow-auto mb-3 p-2 border border-gray',
        // 'fixed bottom-0 right-0 md:w-2/3 ml-10 p-4 flex items-center overflow-auto border border-light-200 dark:border-dark-200',
        // 'fixed bottom-0 right-0 md:w-2/3 w-full p-1 bg-white dark:bg-transparent shadow-black-400 px-10',
        mode === 'multi' ? 'flex-row rounded-lg' : 'flex-row rounded-full',
      )}
    >
      <TextareaAutosize
        value={message}
        onChange={(e) => handleInputChange(e)}
        onHeightChange={(height, props) => {
          setTextareaRows(Math.ceil(height / props.rowHeight));
        }}
        className="transition bg-transparent dark:bg-dark-secondary dark:placeholder:text-white/50 placeholder:text-sm text-base dark:text-white resize-none focus:outline-none w-full px-5 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
        placeholder=" Ask a question..."
      />
      {mode === 'single' && (
        <div className="flex flex-row items-center space-x-4">
          <button
            disabled={message.trim().length === 0 || loading}
            className="bg-gray-400 text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2"
          >
            <ArrowUp className="" size={17} />
          </button>
        </div>
      )}
      {mode === 'multi' && (
        <div className="flex flex-row items-center">
          <div className="flex flex-row items-center space-x-4">
            <button
              disabled={message.trim().length === 0 || loading}
              className="bg-gray-400 text-white text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2 ml-10"
            >
              <ArrowUp className="" size={17} />
            </button>
          </div>
        </div>
      )}
    </form>
    </>
  );
};

export default MessageInput;
