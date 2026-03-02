import React from 'react';

const DaySelector = ({ selectedDays, onChange }) => {
    const days = [
        { label: 'M', value: 'Monday' },
        { label: 'T', value: 'Tuesday' },
        { label: 'W', value: 'Wednesday' },
        { label: 'T', value: 'Thursday' },
        { label: 'F', value: 'Friday' },
        { label: 'S', value: 'Saturday' },
        { label: 'S', value: 'Sunday' },
    ];

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">Select Days *</label>
            <div className="flex gap-2 justify-center">
                {days.map((day, index) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`size-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${isSelected
                                ? 'bg-transparent border-yellow-400 text-white shadow-[0_0_10px_-2px_rgba(250,204,21,0.3)]'
                                : 'bg-[#2A2D3E] border-transparent text-text-muted hover:bg-bg-main hover:text-text-main'
                                }`}
                        >
                            {day.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DaySelector;
