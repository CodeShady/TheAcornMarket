export function getNextFriday() {
    const today = new Date();
    const friday = new Date(today);

    // Find the next Friday
    friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);

    // Set time to 00:00
    friday.setHours(22, 0, 0, 0);

    return friday;
}

export function getDateBeforeToday(days) {
    let today = new Date();
    let theDayBefore = new Date(today);
    theDayBefore.setDate(today.getDate() + days);
    return theDayBefore;
}