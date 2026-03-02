const normalizeWorkingDays = (workingDays) => {
  if (!workingDays) return [1, 2, 3, 4, 5, 6];

  // Case 1: Already an array
  if (Array.isArray(workingDays)) return workingDays;

  // Case 2: JSON string "[1,2,3]"
  if (typeof workingDays === "string") {
    try {
      const parsed = JSON.parse(workingDays);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Case 3: "1,2,3,4,5"
      return workingDays
        .split(",")
        .map(d => d.trim())
        .map(d =>
          isNaN(d) ? DAY_NAME_TO_NUMBER[d.toLowerCase()] : Number(d)
        )
        .filter(Boolean);
    }
  }

  return [1, 2, 3, 4, 5, 6];
};
const DAY_NAME_TO_NUMBER = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const addBusinessHours = (startDate, hoursToAdd, config, holidays) => {
  let cursor = new Date(startDate);
  let hoursRemaining = Number(hoursToAdd);

  const [startHour, startMinute] = config.office_start_time.split(":").map(Number);
  const [endHour, endMinute] = config.office_end_time.split(":").map(Number);

  // ✅ SAFE normalization
  const workingDaysRaw = normalizeWorkingDays(config.working_days);
  const workingDays = workingDaysRaw.map(d =>
    typeof d === "string" ? DAY_NAME_TO_NUMBER[d.toLowerCase()] : d
  );

  // ✅ Holiday normalization (LOCAL date)
  const holidaySet = new Set(
    holidays.map(h => {
      const d = new Date(h.holiday_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  const resetToOfficeStart = (date) => {
    const d = new Date(date);
    d.setHours(startHour, startMinute, 0, 0);
    return d;
  };

  const isWorkingDay = (date) => {
    const jsDay = date.getDay(); // 0=Sun
    const configDay = jsDay === 0 ? 7 : jsDay;

    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return workingDays.includes(configDay) && !holidaySet.has(localDate);
  };

  const moveToNextWorkingDay = (date) => {
    let d = new Date(date);
    do {
      d.setDate(d.getDate() + 1);
    } while (!isWorkingDay(d));
    return resetToOfficeStart(d);
  };

  // ---- Initial alignment ----
  if (!isWorkingDay(cursor)) {
    cursor = moveToNextWorkingDay(cursor);
  } else {
    const currentTime = cursor.getHours() + cursor.getMinutes() / 60;
    const officeStartTime = startHour + startMinute / 60;
    const officeEndTime = endHour + endMinute / 60;

    if (currentTime < officeStartTime) {
      cursor = resetToOfficeStart(cursor);
    } else if (currentTime >= officeEndTime) {
      cursor = moveToNextWorkingDay(cursor);
    }
  }

  // ---- Main loop ----
  while (hoursRemaining > 0) {
    const currentTime = cursor.getHours() + cursor.getMinutes() / 60;
    const officeEndTime = endHour + endMinute / 60;

    const hoursAvailableToday = officeEndTime - currentTime;

    if (hoursAvailableToday <= 0) {
      cursor = moveToNextWorkingDay(cursor);
      continue;
    }

    if (hoursRemaining <= hoursAvailableToday) {
      cursor = new Date(cursor.getTime() + hoursRemaining * 60 * 60 * 1000);
      hoursRemaining = 0;
    } else {
      hoursRemaining -= hoursAvailableToday;
      cursor = moveToNextWorkingDay(cursor);
    }
  }

  return cursor;
};

module.exports = { addBusinessHours };
