import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWork, useSubmitWork, useUploadWorkFile } from '@/hooks/useWorks';
import { useDownloadWorkFile, triggerFileDownload } from '@/hooks/useWorkFile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { UniverEditor } from '@/components/spreadsheet/UniverEditor';
import { Modal } from '@/components/ui/Modal';

export function WorkDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: work, isLoading, error } = useWork(Number(id));
  const submitMutation = useSubmitWork();
  const uploadMutation = useUploadWorkFile();
  const downloadMutation = useDownloadWorkFile();

  const isSubmitted = work?.status === 'submitted';

  const handleDownload = async () => {
    if (!work) return;
    try {
      const blob = await downloadMutation.mutateAsync(work.id);
      triggerFileDownload(blob, `work-${work.id}-${work.agreement_number}.xlsx`);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const confirmUpload = async () => {
    if (!work || !selectedFile) return;
    try {
      await uploadMutation.mutateAsync({ id: work.id, file: selectedFile });
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSubmit = async () => {
    if (!work) return;
    if (!window.confirm('Are you sure you want to submit this work for approval?')) {
      return;
    }
    try {
      await submitMutation.mutateAsync(work.id);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleBack = () => {
    navigate('/works');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-64" />
        <Card>
          <CardContent>
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !work) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load work details: {(error as { message?: string })?.message || 'Work not found'}
            </p>
            <Button variant="secondary" onClick={handleBack}>
              Back to Works List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={handleBack} className="text-slate-500 hover:text-slate-700 text-sm mb-2 flex items-center">
            ← Back to Works List
          </button>
          <h2 className="text-2xl font-semibold text-slate-800">{work.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Agreement: {work.agreement_number}</p>
        </div>
        <Badge status={work.status} />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Work Details</h3>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-slate-500">Work ID</dt>
              <dd className="mt-1 text-base font-mono text-slate-800">#{work.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Contractor</dt>
              <dd className="mt-1 text-base text-slate-800">{work.contractor}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Agreement Number</dt>
              <dd className="mt-1 text-base font-mono text-slate-800">{work.agreement_number}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Measurement Book</h3>
        </CardHeader>
        <CardContent>
          <UniverEditor fileBlob={null} readOnly={isSubmitted} />
          {isSubmitted && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
              ⚠️ This work has been submitted. Editing is restricted in this demo.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleDownload} isLoading={downloadMutation.isPending}>
              📥 Download Excel
            </Button>
            <Button variant="secondary" onClick={handleUploadClick} disabled={isSubmitted} isLoading={uploadMutation.isPending}>
              📤 Upload/Replace
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitted} isLoading={submitMutation.isPending}>
              ✓ Submit for Approval
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }}
        title="Confirm File Upload"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmUpload} isLoading={uploadMutation.isPending}>
              Upload
            </Button>
          </>
        }
      >
        <p className="text-slate-600">You are about to replace the Excel file for this work.</p>
        <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
          <p className="text-sm font-medium text-slate-700">File: {selectedFile?.name}</p>
          <p className="text-sm text-slate-500">Size: {selectedFile ? (selectedFile.size / 1024).toFixed(2) : 0} KB</p>
        </div>
        <p className="mt-4 text-sm text-amber-600">⚠️ This action will overwrite the existing file.</p>
      </Modal>
    </div>
  );
}

export default WorkDashboard;