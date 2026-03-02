import React from 'react';

const MultiDateSelector = ({ selectedDates = [], onChange }) => {
    // Generate dates 1 to 31
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);

    const toggleDate = (date) => {
        if (selectedDates.includes(date)) {
            onChange(selectedDates.filter(d => d !== date));
        } else {
            onChange([...selectedDates, date].sort((a, b) => a - b));
        }
    };

    return (
        <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">Select Dates (Monthly) *</label>
            <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                    const isSelected = selectedDates.includes(date);
                    return (
                        <button
                            key={date}
                            type="button"
                            onClick={() => toggleDate(date)}
                            className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${isSelected
                                ? 'bg-yellow-500 text-black border-yellow-500 shadow-md'
                                : 'bg-bg-main/50 border-transparent text-text-muted hover:bg-bg-main hover:text-text-main'
                                }`}
                        >
                            {date}
                        </button>
                    );
                })}
            </div>
            <p className="text-[10px] text-text-muted mt-2 px-1">
                Tasks will be generated on these dates every month.
            </p>
        </div>
    );
};

export default MultiDateSelector;
