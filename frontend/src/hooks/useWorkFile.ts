import { useMutation } from '@tanstack/react-query';
import { worksApi } from '@/api/works';

/**
 * Hook to download work file
 */
export function useDownloadWorkFile() {
  return useMutation<Blob, { message: string }, number>({
    mutationFn: worksApi.downloadWorkFile,
  });
}

/**
 * Trigger file download in browser
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}