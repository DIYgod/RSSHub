import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';

type ImageEntry = {
    date: Date;
    content: string;
};

const dateParsingRegex = /([0-9]{17})/;

function extractImageDate(imageId: string): string {
    const dateString = imageId.match(dateParsingRegex)?.[0];
    if (!dateString) {
        return '';
    }

    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(8, 10);
    const minute = dateString.slice(10, 12);
    const second = dateString.slice(12, 14);
    const millisecond = dateString.slice(14, 17);

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}+08:00`;
}

function parseImageDate(date: string): string {
    const now = dayjs();

    return `${now.year()}/${date}`;
}

export function packImageElement(imageUrl: string, referenceDateTime: string): ImageEntry {
    const imageId = imageUrl.match(dateParsingRegex)?.[0] || '';
    const imageDate = extractImageDate(imageId);
    const referenceDate = parseImageDate(referenceDateTime);

    const parsedDate = parseDate(imageDate || referenceDate);

    return {
        date: parsedDate,
        content: `<img src="${imageUrl}" />`,
    };
}
