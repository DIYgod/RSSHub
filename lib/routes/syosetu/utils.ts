import { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { config } from '@/config';

/**
 * @see https://dev.syosetu.com/man/man/
 */

interface NovelResponse {
    0: { allcount: number };
    1: {
        title: string;
        story: string;
        keyword: string;
        general_lastup: string;
        general_all_no: number;
        noveltype: number;
    };
}
export async function fetchNovelInfo(ncode: string) {
    const [generalRes, r18Res] = await Promise.all([ofetch(`https://api.syosetu.com/novelapi/api?ncode=${ncode}&out=json&of=t-s-k-ga-nt`), ofetch(`https://api.syosetu.com/novel18api/api?ncode=${ncode}&out=json&of=t-s-k-ga-nt`)]);

    const isR18 = !generalRes[0].allcount;
    const novelData: NovelResponse = isR18 ? r18Res : generalRes;
    const baseUrl = isR18 ? 'https://novel18.syosetu.com' : 'https://ncode.syosetu.com';

    if (!novelData[0].allcount) {
        throw new InvalidParameterError('Novel not found in both APIs');
    }

    return {
        baseUrl,
        novel: novelData[1],
    };
}

export async function fetchChapterContent(chapterUrl: string): Promise<DataItem> {
    return (await cache.tryGet(chapterUrl, async () => {
        const response = await ofetch(chapterUrl, {
            headers: {
                Cookie: 'over18=yes',
                'User-Agent': config.ua,
            },
        });

        const $ = load(response);

        const title = $('.p-novel__title').html() || '';
        const description = $('.p-novel__body').html() || '';
        const pubDate = $('meta[name=WWWC]').attr('content');

        return {
            title,
            description,
            link: chapterUrl,
            pubDate,
            language: 'ja',
        };
    })) as DataItem;
}
