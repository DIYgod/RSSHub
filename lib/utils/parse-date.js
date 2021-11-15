import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

const patterns = [
    {
        regexp: /^(\d+)分钟前$/,
        handler: (minute) => dayjs().subtract(minute, 'minutes'),
    },
    {
        regexp: /^(\d+)小时前$/,
        handler: (hour) => dayjs().subtract(hour, 'hours'),
    },
    {
        regexp: /^(\d+)天前$/,
        handler: (day) => dayjs().subtract(day, 'days'),
    },
    {
        regexp: /^今天\s*((\d+:\d+)?)$/,
        handler: (hm) => dayjs(hm || '0:0', ['HH:m', 'HH:mm', 'H:m', 'H:mm']),
    },
    {
        regexp: /^昨天\s*((\d+:\d+)?)$/,
        handler: (hm) => dayjs(hm || '0:0', ['HH:m', 'HH:mm', 'H:m', 'H:mm']).subtract(1, 'day'),
    },
    {
        regexp: /^前天\s*((\d+:\d+)?)$/,
        handler: (hm) => dayjs(hm || '0:0', ['HH:m', 'HH:mm', 'H:m', 'H:mm']).subtract(2, 'day'),
    },
];


export const parseDate = (date, ...options) => dayjs(date, ...options).toDate()
export const parseRelativeDate = (date) => {
        for (const pattern of patterns) {
            const match = pattern.regexp.exec(date);
            if (match !== null) {
                return pattern.handler(match[1]).toDate();
            }
        }
        return null;
}

