import { parseDate, parseRelativeDate } from '@/utils/time';

export const parseDateText = (text: string) => {
    const absolute = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?/.exec(text)?.[0];
    return absolute ? parseDate(absolute.replaceAll('/', '-'), 8) : parseRelativeDate(text);
};
