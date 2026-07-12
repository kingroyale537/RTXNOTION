// hooks/useUpload.ts
// File upload hook with progress tracking and local preview.

"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UploadResult {
  url: string;
  mediaId: string;
  name: string;
}

interface UseUploadOptions {
  workspaceId: string;
  onSuccess?: (result: UploadResult) => void;
}

export function useUpload({ workspaceId, onSuccess }: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);

      try {
        // Use XMLHttpRequest for progress tracking
        const result = await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const json = JSON.parse(xhr.responseText);
              resolve(json.data as UploadResult);
            } else {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.error ?? "Upload failed"));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error")));

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        onSuccess?.(result);
        return result;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        return null;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [workspaceId, onSuccess]
  );

  const uploadFromInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [upload]
  );

  return { upload, uploadFromInput, isUploading, progress };
}
