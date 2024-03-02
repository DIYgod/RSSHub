import { strict as assert } from 'assert';

const millisInAnHour = 60 * 60 * 1000;
const serverTimezone = -new Date().getTimezoneOffset() / 60;

export default function (date, timezone = serverTimezone) {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    assert(date instanceof Date);

    return new Date(date.getTime() - millisInAnHour * (timezone - serverTimezone));
}
