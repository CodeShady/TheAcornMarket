export function getCurrentDateTime() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
    const hour = now.getHours();
    const minute = now.getMinutes();

    return {
        dayOfWeek: dayOfWeek,
        hour: hour,
        minute: minute
    };
}