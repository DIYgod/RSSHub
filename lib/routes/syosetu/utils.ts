import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { NarouNovelFetch, type NarouSearchResult, SearchBuilder, SearchBuilderR18 } from 'narou';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export function getNovelDates(novel: Pick<NarouSearchResult, 'general_firstup' | 'novelupdated_at'>): Partial<DataItem> {
    return {
        pubDate: novel.general_firstup ? timezone(parseDate(novel.general_firstup, 'YYYY-MM-DD HH:mm:ss'), 9) : undefined,
        updated: novel.novelupdated_at ? timezone(parseDate(novel.novelupdated_at, 'YYYY-MM-DD HH:mm:ss'), 9) : undefined,
    };
}

export async function fetchChapterPublicationDates(novelUrl: string): Promise<Map<string, Date>> {
    const response = await ofetch(novelUrl, {
        headers: {
            Cookie: 'over18=yes',
            'User-Agent': config.ua,
        },
    });
    const $ = load(response);
    const dates = new Map<string, Date>();
    for (const element of $('.p-eplist__sublist').toArray()) {
        const link = $('a.p-eplist__subtitle', element).attr('href');
        const publication = copyNodes($('.p-eplist__update', element));
        publication.children().remove();
        const date = publication.text().match(/\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}/)?.[0];
        if (!link || !date) {
            continue;
        }
        const publishedAt = date.replaceAll(/\s+/g, ' ');
        dates.set(new URL(link, novelUrl).href.replace(/\/$/, ''), timezone(parseDate(publishedAt, 'YYYY/MM/DD HH:mm'), 9));
    }
    return dates;
}

type NovelInfo = Pick<NarouSearchResult, 'title' | 'story' | 'keyword' | 'general_all_no' | 'noveltype' | 'general_firstup' | 'novelupdated_at'>;

export async function fetchNovelInfo(ncode: string): Promise<{ baseUrl: string; novel: NovelInfo }> {
    const api = new NarouNovelFetch();
    const [generalRes, r18Res] = await Promise.all([
        new SearchBuilder<keyof NovelInfo>({ gzip: 5, of: 't-s-k-ga-nt-nu-gf' }, api).ncode(ncode).execute(),
        new SearchBuilderR18<keyof NovelInfo>({ gzip: 5, of: 't-s-k-ga-nt-nu-gf' }, api).ncode(ncode).execute(),
    ]);

    const isGeneral = generalRes.allcount !== 0;
    const novelData = isGeneral ? generalRes : r18Res;
    const baseUrl = isGeneral ? 'https://ncode.syosetu.com' : 'https://novel18.syosetu.com';

    if (novelData.allcount === 0) {
        throw new InvalidParameterError('Novel not found in both APIs');
    }

    return {
        baseUrl,
        novel: novelData.values[0],
    };
}

export async function fetchChapterContent(chapterUrl: string, chapter?: number): Promise<DataItem> {
    return await cache.tryGet(chapterUrl, async (): Promise<DataItem> => {
        const response = await ofetch(chapterUrl, {
            headers: {
                Cookie: 'over18=yes',
                'User-Agent': config.ua,
            },
        });

        const $ = load(response);

        const title = `${chapter ? `#${chapter} ` : ''}${$('.p-novel__title').html() || ''}`;
        const description = $('.p-novel__body').html();
        const pubDate = $('meta[name=WWWC]').attr('content');

        return {
            title,
            description,
            link: chapterUrl,
            pubDate,
            language: 'ja',
        };
    });
}

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
