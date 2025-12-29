import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, isProcessing }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="w-full flex flex-col items-center justify-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label 
        htmlFor="file-upload" 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer 
          transition-all duration-300 ease-in-out
          ${isProcessing 
            ? 'border-indigo-300 bg-indigo-50 opacity-75' 
            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-indigo-500'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isProcessing ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 bg-indigo-200 rounded-full mb-3"></div>
              <p className="text-sm text-indigo-600 font-semibold">در حال پردازش تصویر...</p>
            </div>
          ) : (
            <>
              <div className="bg-indigo-100 p-3 rounded-full mb-3 text-indigo-600">
                <Upload size={24} />
              </div>
              <p className="mb-2 text-lg font-semibold text-slate-700">
                آپلود اسکرین‌شات چت
              </p>
              <p className="mb-2 text-sm text-slate-500">
                بکشید و رها کنید یا کلیک کنید
              </p>
              <p className="text-xs text-slate-400 mt-2">
                پشتیبانی از فرمت‌های PNG و JPG (پردازش امن)
              </p>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>

      {/* Trust Badge */}
      <div className="mt-6 flex items-center space-x-2 text-slate-400 text-xs bg-slate-100 py-2 px-4 rounded-full">
        <ImageIcon size={14} />
        <span>تصاویر بلافاصله پس از پردازش حذف می‌شوند و ذخیره نمی‌گردند.</span>
      </div>
    </div>
  );
};

export default UploadZone;