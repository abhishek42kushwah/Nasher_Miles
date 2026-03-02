import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchLocations, fetchPCAccountables, fetchProblemSolvers } from '../../store/slices/masterSlice';
import { API_BASE_URL } from '../../config';
import useHolidayCheck from "../../hooks/useHolidayCheck";
const HelpTicketForm = ({ onSuccess }) => {
    const { user, token } = useSelector((state) => state.auth);
    const { locations, pcAccountables, problemSolvers } = useSelector((state) => state.master);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { isInvalidDate  } = useHolidayCheck();

    const [formData, setFormData] = useState({
        location: '',
        pc_accountable: '',
        issue_description: '',
        problem_solver: '',
        desired_date: '',
        priority: 'Medium',
        image: null
    });

    useEffect(() => {
        if (token) {
            dispatch(fetchLocations());
            dispatch(fetchPCAccountables());
            dispatch(fetchProblemSolvers());
        }
    }, [dispatch, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       
      if (isInvalidDate(formData.desired_date)) {
  toast.error("Selected date is not available. Please choose another date.");
  return;
}


     setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' && formData[key]) {
                data.append('image_upload', formData[key]);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            // Helper to make API calls with bearer token
            const response = await fetch(`${API_BASE_URL}/api/help-tickets/raise`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                toast.success('Help Ticket raised successfully');
                setFormData({
                    location: '',
                    pc_accountable: '',
                    issue_description: '',
                    problem_solver: '',
                    desired_date: '',
                    priority: 'Medium',
                    image: null
                });
                if (onSuccess) onSuccess();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to raise ticket');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Internal server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_task</span>
                Raise Help Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-5">
                    {/* Location */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Location</label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main"
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Raised By (Read-only) */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Raised By</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            readOnly
                            className="w-full bg-bg-main/50 border border-border-main rounded-lg px-4 py-2.5 text-text-muted cursor-not-allowed"
                        />
                    </div>

                    {/* PC Accountable */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">PC/EA Accountable</label>
                        <select
                            name="pc_accountable"
                            value={formData.pc_accountable}
                            onChange={handleChange}
                            required
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main"
                        >
                            <option value="">Select PC/EA</option>
                            {pcAccountables.map(pc => (
                                <option key={pc.id} value={pc.id}>{pc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Priority</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main"
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    {/* Problem Solver */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Problem Solver</label>
                        <select
                            name="problem_solver"
                            value={formData.problem_solver}
                            onChange={handleChange}
                            required
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main"
                        >
                            <option value="">Select Solver</option>
                            {problemSolvers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Desired Date */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Desired Date</label>
                        <input
                            type="date"
                            name="desired_date"
                            value={formData.desired_date}
                            onChange={handleChange}
                            required
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main"
                        />
                    </div>

                    {/* Issue Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Issue Description</label>
                        <textarea
                            name="issue_description"
                            value={formData.issue_description}
                            onChange={handleChange}
                            required
                            placeholder="Describe the problem in detail..."
                            rows="3"
                            className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-text-main resize-none"
                        ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-muted ml-1">Upload Proof/Image (Optional)</label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                id="help-ticket-image-upload"
                            />
                            <label
                                htmlFor="help-ticket-image-upload"
                                className="flex items-center gap-2 cursor-pointer bg-bg-main border-2 border-dashed border-border-main hover:border-primary transition-colors rounded-lg p-4 text-text-muted w-full justify-center"
                            >
                                <span className="material-symbols-outlined">image</span>
                                <span className="truncate max-w-[200px]">{formData.image ? formData.image.name : 'Click to select an image'}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 sticky bottom-0"
                >
                    {loading ? (
                        <>
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">send</span>
                            Raise Ticket
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default HelpTicketForm;
