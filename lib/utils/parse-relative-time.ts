import dayjs from 'dayjs';

const UNIT_PATTERNS: { unit: dayjs.ManipulateType; regExp: RegExp }[] = [
    { unit: 'days', regExp: /(\d+)\s*天前/ },
    { unit: 'hours', regExp: /(\d+)\s*小时前/ },
    { unit: 'minutes', regExp: /(\d+)\s*分钟前/ },
    { unit: 'seconds', regExp: /(\d+)\s*秒前/ },
];

const CN_NUM_MAP: Record<string, string> = {
    一: '1',
    二: '2',
    两: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
    十: '10',
};

const normalize = (date: string): string => {
    let str = date.trim();

    if (/^刚刚$/.test(str)) {
        return '刚刚';
    }

    str = str.replace(/[一二两三四五六七八九十]/g, (match) => CN_NUM_MAP[match] || match);
    str = str.replace(/几|幾|数/g, '3');

    return str;
};

export const parseRelativeTime = (date: string): string => {
    if (!date) {
        return dayjs().toISOString();
    }

    const normalized = normalize(date);

    if (normalized === '刚刚') {
        return dayjs().subtract(3, 'seconds').toISOString();
    }

    for (const { unit, regExp } of UNIT_PATTERNS) {
        const match = regExp.exec(normalized);
        if (match) {
            const val = Number.parseInt(match[1], 10);
            if (!Number.isNaN(val)) {
                return dayjs().subtract(val, unit).toISOString();
            }
        }
    }

    return dayjs().toISOString();
};
