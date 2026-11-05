import { parseRelativeDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const parseDateText = (text?: string) => {
    if (!text?.trim()) {
        return;
    }
    const absolute = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?/.exec(text)?.[0];
    const date = absolute ? parseDateInTimezone(absolute.replaceAll('/', '-'), 8) : parseRelativeDate(text);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
