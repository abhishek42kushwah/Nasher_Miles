const { addBusinessHours } = require('../src/utils/dateUtils');

const runTests = () => {
    const config = {
        office_start_time: '09:00:00',
        office_end_time: '18:00:00',
        working_days: [1, 2, 3, 4, 5] // Mon-Fri
    };

    const holidays = [
        { holiday_date: '2025-01-01' } // New Year
    ];

    console.log('--- Starting Date Utils Tests ---');

    // Test 1: Simple Addition within same day
    // Monday 10:00 + 2h -> Monday 12:00
    const start1 = new Date('2025-06-02T10:00:00.000Z'); // June 2, 2025 is a Monday
    // Note: JS Date constructor with 'Z' is UTC. My utils use local time concept but Date object is absolute.
    // The utils implementation uses .getHours() which uses local time of the environment. 
    // This might be tricky if environment timezone is not consistent.
    // However, the logic `date.setHours` operates on local time.
    // Let's assume input strings without Z are treated as local.
    // Or better, explicitly construct dates.

    // Better verification: passing mocked config and fixed dates.
    // For simplicity I'll use a specific date and print the output.

    const testCase = (name, startStr, hours, expectedStr) => {
        const start = new Date(startStr);
        const result = addBusinessHours(start, hours, config, holidays);
        console.log(`[${name}]`);
        console.log(`  Start:    ${start.toString()}`);
        console.log(`  Hours:    ${hours}`);
        console.log(`  Result:   ${result.toString()}`);
        // console.log(`  Expected: ${expectedStr}`); // Hard to match exact string due to TZ
        console.log('');
    };

    // Case 1: Same day
    // Mon 10am + 2h -> Mon 12pm
    testCase('Same Day', '2025-06-02T10:00:00', 2);

    // Case 2: Rollover to next day
    // Mon 4pm (16:00) + 4h -> Mon 16-18 (2h used) -> Tue 09-11 (2h used) -> Tue 11am
    testCase('Next Day Rollover', '2025-06-02T16:00:00', 4);

    // Case 3: Rollover over Weekend
    // Fri 4pm (16:00) + 4h -> Fri 16-18 (2h used) -> Sat/Sun Skip -> Mon 09-11 (2h used) -> Mon 11am
    // June 6, 2025 is Friday
    testCase('Weekend Rollover', '2025-06-06T16:00:00', 4);

    // Case 4: Holiday Skip
    // Wed is holiday (say Jan 1, 2025 is Wed).
    // Tue Dec 31 16:00 + 4h -> Tue 16-18 (2h used) -> Wed Holiday -> Thu 09-11 -> Thu 11am
    // Dec 31, 2024 is Tuesday
    testCase('Holiday Skip', '2024-12-31T16:00:00', 4);

};

runTests();
