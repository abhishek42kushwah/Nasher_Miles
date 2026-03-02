import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CompleteChecklistModal = ({ isOpen, onClose, onComplete, task }) => {
    const [proofFile, setProofFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !task) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If verification is required, enforce file upload
        if (task.verification_required && !proofFile) {
            toast.error('Verification proof is required for this task.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('status', 'Completed');
            if (proofFile) {
                formData.append('proof_file', proofFile);
            }

            await onComplete(task.id, formData);
            onClose();
        } catch (error) {
            console.error('Submission failed', error);
            // Toast handled in parent or here? Parent usually for API calls but here is fine too
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-bg-card border border-border-main rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border-main flex justify-between items-center">
                    <h2 className="text-lg font-bold text-text-main">Complete Task</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                        <p className="text-xs font-bold text-text-muted uppercase mb-1">Task</p>
                        <p className="text-sm font-bold text-text-main">{task.question || task.task}</p>
                    </div>

                    {task.verification_required && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-xl">verified_user</span>
                            <p className="text-xs font-bold text-amber-500">Verification Proof Required</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase">Upload Proof (Image/PDF)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border border-border-main rounded-xl bg-bg-main transition-all"
                            />
                            <div className="absolute inset-0 rounded-xl border border-dashed border-border-main pointer-events-none group-hover:border-primary/50 transition-colors"></div>
                        </div>
                        {proofFile && (
                            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {proofFile.name}
                            </p>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-text-muted hover:bg-bg-main transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">check</span>
                                    Complete Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteChecklistModal;
