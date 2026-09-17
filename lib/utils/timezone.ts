const millisInAnHour = 60 * 60 * 1000;

export default function timezone(date: string | number | Date, timezone?: number) {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Read the host offset off the date being converted, not off `new Date()`: in a
    // DST zone the two can sit on opposite sides of a transition.
    const serverTimezone = -dateObj.getTimezoneOffset() / 60;

    return new Date(dateObj.getTime() - millisInAnHour * ((timezone ?? serverTimezone) - serverTimezone));
}
