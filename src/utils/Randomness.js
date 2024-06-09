export function getRandomNumber(min, max) {
    // Ensure minimum is less than or equal to maximum
    if (min > max) {
        throw new Error("Minimum value must be less than or equal to maximum value.");
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}