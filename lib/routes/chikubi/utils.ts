import { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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

function processDescription(description: string): string {
    const $ = load(description);
    return $('body')
        .children()
        .map((_, el) => $(el).clone().wrap('<div>').parent().html())
        .toArray()
        .join('');
}

export async function getPostById(id: string): Promise<DataItem> {
    const baseUrl = 'https://chikubi.jp';
    const url = `${baseUrl}/wp-json/wp/v2/posts/${id}`;

    const response = await got(url);
    const data = JSON.parse(response.body);

    return {
        title: data.title.rendered,
        link: data.link,
        pubDate: parseDate(data.date),
        description: processDescription(data.content.rendered),
    };
}

export async function getPostsByIdList(ids: string[]): Promise<DataItem[]> {
    const items = await Promise.all(
        ids.map(async (id) => {
            try {
                return await getPostById(id);
            } catch (error) {
                throw new Error(`Error processing post ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        })
    );

    return items.filter((item): item is DataItem => item !== null);
}

export async function processItems(list): Promise<DataItem[]> {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const contentType = getContentType(item.link);
                const selectors = contentTypes[contentType];

                const title = $(selectors.title).text().trim() || item.title;
                const description = processDescription(selectors.description.map((selector) => $(selector).prop('outerHTML')).join(''));

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
