import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { DataItem } from '@/types';
import dayjs from 'dayjs';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

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

function fetchPageCached(url: string): Promise<string> {
    return cache.tryGet(url, async () => {
        const page = await ofetch(url);
        return page;
    }) as Promise<string>;
}

export async function fetchImages(url: string, title: string): Promise<DataItem[]> {
    const page = await fetchPageCached(url);
    const $ = load(page);
    const timeColumnItems = $('.col-xs-12.time').toArray();

    const entries = timeColumnItems.map((it) => {
        const element = $(it);
        const imageUrl = element.attr('data-img') || '';
        const refernceTime = element.text().trim();

        return packImageElement(imageUrl, refernceTime);
    });

    return entries.map((entry) => {
        const date = entry.date;
        const content = entry.content;
        return {
            title: `${title} - ${date.toISOString()}`,
            description: content,
            link: url,
            pubDate: date,
        };
    });
}
