import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Markdown from "markdown-to-jsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn, Message } from "@/lib/utils";

interface Props {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  currentVersionIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
}

const VersionComparisonDialog = ({ message, isOpen, onClose, currentVersionIndex, onNavigate }: Props) => {
  if (!message.previousVersions?.length) return null;
  const versions = [...message.previousVersions, message.content];
  const currentVersion = versions[currentVersionIndex];
  const previousVersion = versions[currentVersionIndex - 1];

  const getVersionLabel = (index: number): string => {
    // Handle original version
    if (index === 0) return 'No Label';
    
    // Labels are stored for versions after the original
    const labelIndex = index - 1;
    console.log({message});
    if (!message.regenerationLabels?.[labelIndex]) {
      return ``;
    }
    return message.regenerationLabels[labelIndex];
  };

  const getVersionTitle = (index: number): string => {
    if (index === 0) return `Version ${index + 1} (Original)`;
    if (index === versions.length - 1) return `Version ${index + 1} (Current)`;
    return `Version ${index + 1}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 p-4">
            {/* Previous Version */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  {getVersionTitle(currentVersionIndex - 1)}
                </h3>
                <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {getVersionLabel(currentVersionIndex - 1)}
                </span>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
                <Markdown>{previousVersion}</Markdown>
              </div>
            </div>

            {/* Current Version */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  {getVersionTitle(currentVersionIndex)}
                </h3>
                <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                  {getVersionLabel(currentVersionIndex)}
                </span>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
                <Markdown>{currentVersion}</Markdown>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <button
            onClick={() => onNavigate("prev")}
            disabled={currentVersionIndex <= 1}
            className={cn(
              "p-2 rounded-full transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500">
            Version {currentVersionIndex} of {versions.length}
          </span>
          <button
            onClick={() => onNavigate("next")}
            disabled={currentVersionIndex >= versions.length - 1}
            className={cn(
              "p-2 rounded-full transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionComparisonDialog;