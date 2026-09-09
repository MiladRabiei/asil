'use client';

import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  dropzoneClassName?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = '.jpg,.jpeg,.png',
  multiple = false,
  maxSizeMB = 5,
  disabled = false,
  children,
  className,
  dropzoneClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedExtensions = accept
    .split(',')
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean);

  const isAcceptedType = (file: File) => {
    if (acceptedExtensions.length === 0) return true;
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return acceptedExtensions.some((accepted) =>
      accepted.startsWith('.') ? accepted === fileExt : file.type === accepted
    );
  };

  const validate = (files: File[]) => {
    const wrongType = files.find((f) => !isAcceptedType(f));
    if (wrongType) {
      setError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${accept}`);
      return false;
    }
    const tooBig = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    if (validate(files)) onFilesSelected(files);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'm-auto flex w-fit flex-col items-center justify-center text-center',
        className
      )}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          ' w-full cursor-pointer rounded-lg border-2 border-dashed border-primary p-12 transition-colors',
          isDragging && 'border-ring bg-surface-neutral',
          disabled && 'cursor-not-allowed border-muted-foreground opacity-50',
          dropzoneClassName
        )}
      >
        {children}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            // allow re-selecting the same file after a remove
            e.target.value = '';
          }}
        />
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
};

export default FileUploader;
