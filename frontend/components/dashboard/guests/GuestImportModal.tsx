'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GuestImportPreview, GuestImportResult } from '../../../types/api';
import { GuestService } from '../../../services/guests';

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function GuestImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: GuestImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<GuestImportPreview | null>(null);
  const [importResult, setImportResult] = useState<GuestImportResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx') {
        toast.error('Please upload a .csv or .xlsx file');
        return;
      }
      setFile(selected);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    try {
      setIsLoading(true);
      const preview = await GuestService.previewImport(file);
      setPreviewData(preview);
      setStep('preview');
    } catch (err: any) {
      console.error('Import preview failed:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to preview file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData?.token) return;
    try {
      setIsLoading(true);
      const result = await GuestService.commitImport(previewData.token);
      setImportResult(result);
      setStep('result');
      toast.success(`Successfully imported ${result.created} guests!`);
      onImportComplete();
    } catch (err: any) {
      console.error('Import commit failed:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to import guests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const blob = await GuestService.downloadImportTemplate(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guest_import_template.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary-500" />
              Import Guests via CSV / Excel
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Upload spreadsheets with full guest details, seating, dietaries, and plus-ones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag & drop upload area */}
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="guest-file-input"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="guest-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {file ? file.name : 'Click to select or drag and drop a file'}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1">
                    Supports .CSV and .XLSX (up to 5,000 rows)
                  </span>
                </label>
              </div>

              {/* Template download buttons */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                  <span className="font-semibold block text-neutral-900 dark:text-neutral-100">Need a template?</span>
                  Download a pre-formatted template with all supported guest columns.
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('csv')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV Template
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && previewData && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-center">
                  <span className="text-xs text-neutral-500 block">Total Rows</span>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    {previewData.summary.total_rows}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 block">Valid Rows</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {previewData.summary.valid_rows}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 rounded-xl text-center">
                  <span className="text-xs text-rose-600 dark:text-rose-400 block">Invalid Rows</span>
                  <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
                    {previewData.summary.invalid_rows}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 rounded-xl text-center">
                  <span className="text-xs text-amber-600 dark:text-amber-400 block">Duplicates</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {previewData.summary.duplicate_rows}
                  </span>
                </div>
              </div>

              {/* Table preview */}
              <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 sticky top-0">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Validation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {previewData.rows.map((row) => {
                      const data = row.data as any;
                      return (
                        <tr
                          key={row.row}
                          className={
                            !row.valid
                              ? 'bg-rose-500/5'
                              : row.is_duplicate
                              ? 'bg-amber-500/5'
                              : ''
                          }
                        >
                          <td className="p-2.5 text-neutral-400">#{row.row}</td>
                          <td className="p-2.5 font-medium">
                            {data?.first_name || ''} {data?.last_name || ''}
                          </td>
                          <td className="p-2.5 text-neutral-500">{data?.email || '—'}</td>
                          <td className="p-2.5">
                            {row.valid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {row.errors.length > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 block">
                                {row.errors.join(', ')}
                              </span>
                            )}
                            {row.is_duplicate && (
                              <span className="text-amber-600 dark:text-amber-400 block">
                                Possible existing guest duplicate
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'result' && importResult && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Import Complete!</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Successfully imported <span className="font-semibold text-emerald-600">{importResult.created}</span> guests.
                  {importResult.skipped > 0 && ` (${importResult.skipped} skipped)`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!file || isLoading}
                onClick={handlePreview}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Preview & Validate
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Select Different File
              </button>
              <button
                type="button"
                disabled={isLoading || (previewData?.summary.valid_rows || 0) === 0}
                onClick={handleCommit}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Commit Import ({previewData?.summary.valid_rows || 0} Guests)
              </button>
            </>
          )}

          {step === 'result' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
