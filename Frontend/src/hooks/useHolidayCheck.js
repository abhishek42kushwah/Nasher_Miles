import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHelpTicketConfig } from "../store/slices/helpTicketConfigSlice";

/**
 * Convert ISO date (YYYY-MM-DD) to local Date object safely
 */
const parseISOToLocalDate = (date) => {
  if (!date) return null;

  // ✅ Handle datetime-local safely
  const isoDate = typeof date === "string"
    ? date.split("T")[0]
    : date;

  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};


const useHolidayCheck = () => {
  const dispatch = useDispatch();

  const { holidays = [], isLoading } = useSelector(
    (state) => state.helpTicketConfig
  );

  useEffect(() => {
    if (!holidays.length) {
      dispatch(fetchHelpTicketConfig());
    }
  }, [dispatch, holidays.length]);

  /**
   * Check if selected date is a holiday
   */
  const isHolidayDate = (dateISO) => {
    if (!dateISO || !holidays.length) return false;

    const selectedDate = parseISOToLocalDate(dateISO).toDateString();

    return holidays.some((h) => {
      const holidayDate = parseISOToLocalDate(
        h.holiday_date.slice(0, 10)
      ).toDateString();

      return holidayDate === selectedDate;
    });
  };

  /**
   * Check if selected date is in the past
   */
  const isPastDate = (dateISO) => {
    if (!dateISO) return false;

    const selectedDate = parseISOToLocalDate(dateISO);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  };

  /**
   * Combined validation
   */
  const isInvalidDate = (dateISO) => {
    return isPastDate(dateISO) || isHolidayDate(dateISO);
  };

  return {
    holidays,
    isHolidayDate,
    isPastDate,
    isInvalidDate,
    isHolidayLoading: isLoading,
  };
};

export default useHolidayCheck;
