'use client';

import { useCallback, useState } from 'react';

import { apiClient } from '../services/api';

/** One parsed spreadsheet row with its validation outcome. */
export interface ImportRowPreview {
  /** 1-based row number in the source file (header excluded). */
  row: number;
  valid: boolean;
  data: Record<string, unknown> | null;
  errors: string[];
  /** True when the row matches an existing record. */
  is_duplicate: boolean;
}

export interface ImportPreview {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  rows: ImportRowPreview[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors?: string[];
}

function errorMessage(err: unknown): string {
  const response = (err as { response?: { data?: { message?: string } } })?.response?.data;
  return response?.message || (err as Error)?.message || 'Import failed';
}

/**
 * Two-phase (preview -> confirm) import workflow shared by every module that
 * imports spreadsheets (guests today, other modules later).
 *
 * `basePath` is the API prefix for the module, e.g. '/guests'. Phase 1 posts
 * the file as multipart to `{basePath}/import/preview/` and returns per-row
 * validation; phase 2 posts to `{basePath}/import/` with an explicit
 * confirm=true so a file is never imported without being previewed.
 */
export function useImports(basePath: string) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const previewFile = useCallback(
    async (file: File): Promise<ImportPreview | null> => {
      setIsPreviewing(true);
      setError(null);
      setResult(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        // Content-Type is deliberately not set here: the browser must attach
        // the multipart boundary itself.
        const response = await apiClient.post<ImportPreview>(
          `${basePath}/import/preview/`,
          formData
        );
        setPreview(response);
        return response;
      } catch (err) {
        const message = errorMessage(err);
        setError(message);
        setPreview(null);
        return null;
      } finally {
        setIsPreviewing(false);
      }
    },
    [basePath]
  );

  const confirmImport = useCallback(async (): Promise<ImportResult | null> => {
    setIsImporting(true);
    setError(null);
    try {
      const response = await apiClient.post<ImportResult>(`${basePath}/import/`, {
        confirm: true,
      });
      setResult(response);
      setPreview(null);
      return response;
    } catch (err) {
      setError(errorMessage(err));
      return null;
    } finally {
      setIsImporting(false);
    }
  }, [basePath]);

  const reset = useCallback(() => {
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    preview,
    result,
    error,
    isPreviewing,
    isImporting,
    previewFile,
    confirmImport,
    reset,
  };
}

export default useImports;
