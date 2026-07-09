import { useRef, useState } from 'react';
import type { Module } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface FileUploadPanelProps {
  modules: Pick<Module, 'id' | 'title'>[];
  isUploading?: boolean;
  progress?: number | null;
  errorMessage?: string | null;
  onUpload: (file: File, moduleId?: string) => void;
}

export function FileUploadPanel({
  modules,
  isUploading = false,
  progress,
  errorMessage,
  onUpload,
}: FileUploadPanelProps) {
  const [moduleId, setModuleId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, moduleId || undefined);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-border p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-ink">File</label>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-fg hover:file:cursor-pointer hover:file:opacity-90"
        />
      </div>
      <div className="w-full sm:w-56">
        <Select label="Scope" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
          <option value="">Whole project</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleSubmit} disabled={!selectedFile} isLoading={isUploading}>
        Upload
      </Button>
      {isUploading && typeof progress === 'number' && (
        <span className="font-mono text-xs tabular-nums text-ink-muted">{progress}%</span>
      )}
      {errorMessage && (
        <p className="w-full text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
