const millisInAnHour = 60 * 60 * 1000;
const serverTimezone = -new Date().getTimezoneOffset() / 60;

export default function timezone(date: string | number | Date, timezone = serverTimezone) {
    const dateObj = date instanceof Date ? date : new Date(date);

    return new Date(dateObj.getTime() - millisInAnHour * (timezone - serverTimezone));
}
