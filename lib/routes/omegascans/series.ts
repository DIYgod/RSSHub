import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Chapter {
    id: number;
    chapter_name: string;
    chapter_title: string | null;
    chapter_thumbnail: string | null;
    chapter_slug: string;
    price: number;
    created_at: string;
    series: {
        series_slug: string;
        id: number;
    };
}

interface ChapterQueryResponse {
    data: Chapter[];
}

export const route: Route = {
    path: '/series/:id',
    name: 'Series Chapters',
    url: 'omegascans.org',
    maintainers: ['ereneroglum'],
    example: '/omegascans/series/632',
    parameters: {
        id: 'Series ID, can be found in API get request on series page',
    },
    categories: ['anime'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler: async (ctx) => {
        const { id } = ctx.req.param();

        const response = await ofetch<ChapterQueryResponse>('https://api.omegascans.org/chapter/query', {
            query: {
                page: 1,
                perPage: 30,
                series_id: id,
            },
        });

        const chapters = response.data;
        if (chapters.length === 0) {
            throw new NotFoundError(`Series ${id} not found on Omega Scans`);
        }

        const seriesSlug = chapters[0].series.series_slug;
        const seriesTitle = seriesSlug.replaceAll('-', ' ').replaceAll(/\b\w/g, (c) => c.toUpperCase());
        const seriesLink = `https://omegascans.org/series/${seriesSlug}`;

        return {
            title: `Omega Scans - ${seriesTitle}`,
            link: seriesLink,
            image: 'https://omegascans.org/wetried_only.png',
            item: chapters.map((chapter) => ({
                title: chapter.chapter_title ?? chapter.chapter_name,
                link: `https://omegascans.org/series/${chapter.series.series_slug}/${chapter.chapter_slug}`,
                pubDate: parseDate(chapter.created_at),
                image: chapter.chapter_thumbnail ?? undefined,
                guid: `omegascans-chapter-${chapter.id}`,
                category: [chapter.price === 0 ? 'Free' : 'Paid'],
            })),
        };
    },
};
