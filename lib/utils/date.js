const assert = require("assert").strict;
const dayjs = require("dayjs");
dayjs.extend(require('dayjs/plugin/customParseFormat'));


const millisInAnHour = 60 * 60 * 1000;
const serverTimezone = -new Date().getTimezoneOffset() / 60;


module.exports = (date, timezone = serverTimezone, ...dayjsOptions) => {
    if (typeof (date) === "string" || date instanceof String) {
        date = dayjs(date, ...dayjsOptions).toDate();
    } else if (date instanceof dayjs) {
        date = date.toDate();
    }

    assert(date instanceof Date);

    return new Date(date.getTime() - millisInAnHour * (timezone - serverTimezone)).toUTCString();
};
