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
    free_at: string | null;
    series: {
        series_slug: string;
        id: number;
    };
}

interface ChapterQueryResponse {
    data: Chapter[];
}

export const route: Route = {
    path: '/series/:id/:freeOnly?',
    name: 'Series Chapters',
    url: 'omegascans.org',
    maintainers: ['ereneroglum'],
    example: '/omegascans/series/632',
    parameters: {
        id: 'Series ID, can be found in API get request on series page',
        freeOnly: {
            description: 'Filter paid chapters',
            options: [
                { value: 'true', label: 'Only free chapters' },
                { value: 'false', label: 'Include paid chapters' },
            ],
            default: 'true',
        },
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
        const { id, freeOnly } = ctx.req.param();

        const response = await ofetch<ChapterQueryResponse>('https://api.omegascans.org/chapter/query', {
            query: {
                page: 1,
                perPage: 10000,
                series_id: id,
            },
        });

        let chapters = response.data;
        if (freeOnly !== 'false') {
            chapters = chapters.filter((chapter) => chapter.price === 0);
        }

        const seriesSlug = chapters[0]?.series.series_slug;
        const seriesTitle = seriesSlug ? seriesSlug.replaceAll('-', ' ').replaceAll(/\b\w/g, (c) => c.toUpperCase()) : `Series ${id}`;
        const seriesLink = seriesSlug ? `https://omegascans.org/series/${seriesSlug}` : 'https://omegascans.org';

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
            })),
            allowEmpty: true,
        };
    },
};
