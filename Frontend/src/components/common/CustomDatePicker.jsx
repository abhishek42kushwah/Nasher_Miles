import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, setHours, setMinutes, getHours, getMinutes, startOfWeek, endOfWeek } from 'date-fns';

const CustomDatePicker = ({ value, onChange, label, multiple = false }) => {
    // Parser helper: value might be "YYYY-MM-DDTHH:mm" or array of strings
    const parseDate = (val) => {
        if (Array.isArray(val)) return val.length > 0 ? new Date(val[0]) : new Date();
        return val ? new Date(val) : new Date();
    };
    
    const [currentMonth, setCurrentMonth] = useState(parseDate(value));
    const [selectedDate, setSelectedDate] = useState(Array.isArray(value) && !multiple ? parseDate(value[0]) : parseDate(value));
    // For multi-select
    const [selectedDates, setSelectedDates] = useState(
        multiple && Array.isArray(value) ? value.map(d => new Date(d)) : (value ? [new Date(value)] : [])
    );

    const [showPicker, setShowPicker] = useState(false);

    // Time State
    const [time, setTime] = useState({
        hour: format(parseDate(value), 'hh'),
        minute: format(parseDate(value), 'mm'),
        period: format(parseDate(value), 'a')
    });

    useEffect(() => {
        if (value) {
            if (multiple && Array.isArray(value)) {
                setSelectedDates(value.map(d => new Date(d)));
                if (value.length > 0) {
                    const first = new Date(value[0]);
                    setSelectedDate(first);
                    // Only update time if not set? Or sync with first? Let's sync.
                    setTime({
                        hour: format(first, 'hh'),
                        minute: format(first, 'mm'),
                        period: format(first, 'a')
                    });
                }
            } else if (!Array.isArray(value)) {
                const date = new Date(value);
                setSelectedDate(date);
                if (!multiple) setSelectedDates([date]); // Keep synced
                setTime({
                    hour: format(date, 'hh'),
                    minute: format(date, 'mm'),
                    period: format(date, 'a')
                });
            }
        }
    }, [value, multiple]);

    const handleDateClick = (day) => {
        if (multiple) {
            // Toggle
            const exists = selectedDates.find(d => isSameDay(d, day));
            let newDates;
            if (exists) {
                newDates = selectedDates.filter(d => !isSameDay(d, day));
            } else {
                newDates = [...selectedDates, day];
            }
            setSelectedDates(newDates);
            // Update current preview date to clicked one
            setSelectedDate(day);
        } else {
            const newDate = new Date(selectedDate);
            newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
            setSelectedDate(newDate);
        }
    };

    const handleTimeChange = (type, val) => {
        setTime(prev => ({ ...prev, [type]: val }));
    };

    const applyDateTime = () => {
        let hour = parseInt(time.hour);
        if (time.period === 'PM' && hour !== 12) hour += 12;
        if (time.period === 'AM' && hour === 12) hour = 0;

        if (multiple) {
            // Apply time to ALL selected dates
            const finalDates = selectedDates.map(date => {
                const d = new Date(date);
                d.setHours(hour, parseInt(time.minute), 0, 0);

                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hh}:${mm}`;
            }).sort(); // Sort chronologically

            onChange(finalDates);
        } else {
            const finalDate = new Date(selectedDate);
            finalDate.setHours(hour, parseInt(time.minute), 0, 0);

            const year = finalDate.getFullYear();
            const month = String(finalDate.getMonth() + 1).padStart(2, '0');
            const day = String(finalDate.getDate()).padStart(2, '0');
            const hh = String(finalDate.getHours()).padStart(2, '0');
            const mm = String(finalDate.getMinutes()).padStart(2, '0');

            onChange(`${year}-${month}-${day}T${hh}:${mm}`);
        }
        setShowPicker(false);
    };

    // Calendar Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Format display value
    const getDisplayValue = () => {
        if (multiple && Array.isArray(value)) {
            if (value.length === 0) return 'Select Dates & Time';
            if (value.length === 1) return format(new Date(value[0]), 'PPP p');
            return `${value.length} dates selected (${format(new Date(value[0]), 'MMM d')}...)`;
        }
        return value ? format(new Date(value), 'PPP p') : 'Select Date & Time';
    };

    return (
        <div className="relative">
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">{label}</label>

            {/* Input Trigger */}
            <div
                onClick={() => setShowPicker(!showPicker)}
                className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm text-text-main font-bold cursor-pointer hover:border-yellow-500/50 flex items-center justify-between"
            >
                <span>{getDisplayValue()}</span>
                <span className="material-symbols-outlined text-text-muted">calendar_today</span>
            </div>

            {/* Picker Modal */}
            {showPicker && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
                        onClick={() => setShowPicker(false)}
                    />

                    {/* Centered Modal */}
                    <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-card border border-border-main rounded-2xl shadow-2xl w-[340px] md:w-[750px] p-6 flex flex-col md:flex-row gap-8 animate-in zoom-in-95 duration-200">

                        {/* Calendar Section */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-text-muted hover:text-white p-1">
                                    <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
                                </button>
                                <span className="text-sm font-bold text-text-main">{format(currentMonth, 'MMMM yyyy')}</span>
                                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-text-muted hover:text-white p-1">
                                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <span key={d} className="text-[10px] font-bold text-text-muted uppercase">{d}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, i) => {
                                    const isSelected = multiple
                                        ? selectedDates.some(d => isSameDay(d, day))
                                        : isSameDay(day, selectedDate);

                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleDateClick(day)}
                                            className={`size-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                                : isCurrentMonth
                                                    ? 'text-text-main hover:bg-bg-main'
                                                    : 'text-text-muted/30'
                                                }`}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Time Section */}
                        <div className="w-full md:w-[280px] flex flex-col border-l border-border-main pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0">
                            <div className="flex-1 flex flex-col items-center">
                                {/* Large Time Display */}
                                <h3 className="text-3xl font-black text-white tracking-widest mb-8 text-center">
                                    {time.hour}:{time.minute} {time.period}
                                </h3>

                                {/* Time Inputs */}
                                <div className="flex items-start justify-center gap-4 mb-8">
                                    <div className="flex flex-col gap-2 items-center">
                                        <input
                                            type="number" min="1" max="12"
                                            value={time.hour}
                                            onChange={(e) => handleTimeChange('hour', e.target.value.padStart(2, '0'))}
                                            className="w-16 h-16 bg-[#1A1D2D] rounded-xl text-center font-bold text-2xl text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Hour</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white pt-4">:</span>
                                    <div className="flex flex-col gap-2 items-center">
                                        <input
                                            type="number" min="0" max="59"
                                            value={time.minute}
                                            onChange={(e) => handleTimeChange('minute', e.target.value.padStart(2, '0'))}
                                            className="w-16 h-16 bg-[#1A1D2D] rounded-xl text-center font-bold text-2xl text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Min</span>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-2 h-16 justify-between">
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('period', 'AM')}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${time.period === 'AM' ? 'bg-yellow-400 text-black' : 'bg-[#1A1D2D] text-text-muted hover:text-white'}`}
                                        >AM</button>
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('period', 'PM')}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${time.period === 'PM' ? 'bg-yellow-400 text-black' : 'bg-[#1A1D2D] text-text-muted hover:text-white'}`}
                                        >PM</button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={applyDateTime}
                                    className="w-full py-3.5 rounded-xl bg-yellow-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-yellow-400/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    Done
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(multiple ? [] : '');
                                        setShowPicker(false);
                                    }}
                                    className="w-full py-3 rounded-xl bg-[#1A1D2D] text-text-muted text-[10px] font-bold uppercase tracking-wider hover:text-white hover:bg-[#252836] transition-all"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomDatePicker;
