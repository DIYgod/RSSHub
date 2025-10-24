import { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { config } from '@/config';
import { NarouNovelFetch, NarouSearchResult, SearchBuilder, SearchBuilderR18 } from 'narou';

export async function fetchNovelInfo(ncode: string): Promise<{ baseUrl: string; novel: NarouSearchResult }> {
    const api = new NarouNovelFetch();
    const [generalRes, r18Res] = await Promise.all([new SearchBuilder({ gzip: 5, of: 't-s-k-ga-nt-nu' }, api).ncode(ncode).execute(), new SearchBuilderR18({ gzip: 5, of: 't-s-k-ga-nt-nu' }, api).ncode(ncode).execute()]);

    const isGeneral = generalRes.allcount !== 0;
    const novelData = isGeneral ? generalRes : r18Res;
    const baseUrl = isGeneral ? 'https://ncode.syosetu.com' : 'https://novel18.syosetu.com';

    if (novelData.allcount === 0) {
        throw new InvalidParameterError('Novel not found in both APIs');
    }

    return {
        baseUrl,
        novel: novelData.values[0] as NarouSearchResult,
    };
}

export async function fetchChapterContent(chapterUrl: string, chapter?: number): Promise<DataItem> {
    return (await cache.tryGet(chapterUrl, async () => {
        const response = await ofetch(chapterUrl, {
            headers: {
                Cookie: 'over18=yes',
                'User-Agent': config.ua,
            },
        });

        const $ = load(response);

        const title = `${chapter ? `#${chapter} ` : ''}${$('.p-novel__title').html() || ''}`;
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
