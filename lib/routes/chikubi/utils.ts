import { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

interface ListItem {
    title: string;
    link: string;
}

interface ContentSelectors {
    title: string;
    description: string[];
}

const contentTypes: Record<string, ContentSelectors> = {
    doujin: {
        title: '.doujin-title',
        description: ['.doujin-detail', '.section', '.area-buy > a.btn'],
    },
    video: {
        title: '.video-title',
        description: ['.video-data', '.section', '.lp-samplearea a.btn'],
    },
    article: {
        title: '.article_title',
        description: ['.article_icatch', '.article_contents'],
    },
};

function getContentType(link: string): keyof typeof contentTypes {
    const typePatterns = {
        doujin: ['/cg/', '/comic/', '/voice/'],
        video: ['/nipple-video/'],
        article: ['/post-'],
    };

    for (const [type, patterns] of Object.entries(typePatterns)) {
        if (patterns.some((pattern) => link.includes(pattern))) {
            return type as keyof typeof contentTypes;
        }
    }

    throw new Error(`Unknown content type for link: ${link}`);
}

export async function processItems(list: ListItem[]): Promise<DataItem[]> {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const contentType = getContentType(item.link);
                const selectors = contentTypes[contentType];

                const title = $(selectors.title).text().trim() || item.title;
                const description = selectors.description
                    .map((selector) =>
                        $(selector)
                            .map((_, el) => $(el).clone().wrap('<div>').parent().html())
                            .toArray()
                            .join('')
                    )
                    .join('');

                const pubDateStr = $('meta[property="article:published_time"]').attr('content');
                const pubDate = pubDateStr ? parseDate(pubDateStr) : undefined;

                return {
                    title,
                    description,
                    link: item.link,
                    pubDate,
                } as DataItem;
            })
        )
    );

    return items.filter((item): item is DataItem => item !== null);
}
