import crypto from 'node:crypto';

import cityTimezones from 'city-timezones';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const utils = {
    even: (collection) => collection.filter((index) => index % 2 === 0),
    odd: (collection) => collection.filter((index) => index % 2 === 1),
    generateGuid: (t) => {
        const hash = crypto.createHash('sha512');
        hash.update(t);
        const r = hash.digest('hex').toUpperCase();
        return r;
    },
    parseDatetime: (t, o, r, tz, l) => {
        const formatJaDate = 'YYYY/MM/DD';
        const formatJaDateTime = 'YYYY/MM/DD HH:mm';
        const formatEnDate = 'MM/DD/YYYY';
        const formatEnDateTime = 'MM/DD/YYYY HH:mm';
        let customFormat;

        switch (l) {
            case 'ja':
                customFormat = dayjs(t, formatJaDate, true).isValid() ? formatJaDate : dayjs(t, formatJaDateTime, true).isValid() ? formatJaDateTime : undefined;
                break;
            case 'en':
                customFormat = dayjs(t, formatEnDate, true).isValid() ? formatEnDate : dayjs(t, formatEnDateTime, true).isValid() ? formatEnDateTime : undefined;
                break;
            default:
            // empty
        }

        if (o) {
            const packageInJPKeywords = [['郵便局'], ['都', '道', '府', '県']];
            if (packageInJPKeywords[0].some((i) => o.includes(i)) || packageInJPKeywords[1].some((i) => r.includes(i))) {
                tz = 'Asia/Tokyo';
            } else {
                const oS = o.replace(' EMS', '').replace(' INT', '');
                try {
                    try {
                        tz = cityTimezones.lookupViaCity(oS)[0].timezone;
                    } catch {
                        tz = cityTimezones.lookupViaCity(r)[0].timezone;
                    }
                } catch {
                    // empty
                }
            }
        }

        return customFormat ? [dayjs.tz(t, customFormat, tz).valueOf(), tz] : [new Date(t).getTime(), tz];
    },
};

export default utils;
