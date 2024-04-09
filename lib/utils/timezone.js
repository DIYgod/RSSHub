const assert = require('assert').strict;

const millisInAnHour = 60 * 60 * 1000;
const serverTimezone = -new Date().getTimezoneOffset() / 60;

module.exports = (date, timezone = serverTimezone) => {
    if (typeof date === 'string' || date instanceof String) {
        date = new Date(date);
    }

    assert(date instanceof Date);

    return new Date(date.getTime() - millisInAnHour * (timezone - serverTimezone));
};
