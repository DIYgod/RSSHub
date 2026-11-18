import crypto from 'node:crypto';

import cityTimezones from 'city-timezones';

import { parseDate, parseDateStrict } from '@/utils/time';

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
                customFormat = parseDateStrict(t, formatJaDate) ? formatJaDate : parseDateStrict(t, formatJaDateTime) ? formatJaDateTime : undefined;
                break;
            case 'en':
                customFormat = parseDateStrict(t, formatEnDate) ? formatEnDate : parseDateStrict(t, formatEnDateTime) ? formatEnDateTime : undefined;
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

        return customFormat ? [parseDateStrict(t, customFormat, tz)?.epochMilliseconds, tz] : [parseDate(t)?.epochMilliseconds, tz];
    },
};

export default utils;
