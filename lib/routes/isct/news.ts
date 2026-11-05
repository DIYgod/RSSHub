import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface MediaItem {
    ID: string;
    TITLE: string;
    PUBLISH_DATE: string;
    READ_COPY?: string | null;
    MEDIA_CD: string;
    MEDIA_TYPES: string;
}

interface TagItem {
    TAG_ID: string;
    TAG_NAME: string;
}

export const route: Route = {
    path: '/news/:lang',
    categories: ['university'],
    example: '/isct/news/ja',
    parameters: { lang: 'language, could be ja or en' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.isct.ac.jp/:lang/news'],
            target: '/news/:lang',
        },
    ],
    name: 'News',
    maintainers: ['catyyy'],
    handler: async (ctx) => {
        const { lang = 'ja' } = ctx.req.param();
        if (lang !== 'ja' && lang !== 'en') {
            throw new InvalidParameterError('lang must be ja or en.');
        }
        const mediaData = await ofetch<Record<string, MediaItem>>(`http://www.isct.ac.jp/expansion/get_media_list_json.php?lang_cd=${lang}`, { responseType: 'json' });
        const tagData = await ofetch<Record<string, TagItem>>(`http://www.isct.ac.jp/expansion/get_tag_list_json.php?lang_cd=${lang}`, { responseType: 'json' });

        const itemsArray: MediaItem[] = Object.values(mediaData);
        const tagArray: TagItem[] = Object.values(tagData);

        const tagIdNameMapping: { [key: string]: string } = {};

        for (const item of Object.values(tagArray)) {
            tagIdNameMapping[item.TAG_ID] = item.TAG_NAME;
        }

        const items = itemsArray.map((item) => ({
            title: item.TITLE,
            link: 'news/' + item.MEDIA_CD,
            description: item.READ_COPY ?? undefined,
            pubDate: item.PUBLISH_DATE ? timezone(parseDate(item.PUBLISH_DATE, 'YYYY-MM-DD'), 9) : undefined,
            category: item.MEDIA_TYPES
                ? item.MEDIA_TYPES.split(',')
                      .map((id) => tagIdNameMapping[id.replaceAll('"', '').trim()])
                      .filter(Boolean)
                : [],
        }));
        return {
            title: `ISCT News - ${lang}`,
            language: lang,
            link: `https://www.isct.ac.jp/${lang}/news`,
            item: items,
        };
    },
};
