import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/category/:category/:staffpicks?',
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/vimeo/category/documentary/staffpicks',
    parameters: {
        category: 'Category name can get from url like `documentary` in [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) ',
        staffpicks: 'type `staffpicks` to sort with staffpicks',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['MisteryMonster'],
    handler,
};

async function handler(ctx) {
    const { category, staffpicks } = ctx.req.param();

    const categoryParams = category;
    let sortParams = '&direction=desc&sort=date';
    let feedTitle = category;
    if (staffpicks && staffpicks !== 'staffpicks') {
        throw new NotFoundError('Invalid Vimeo staff picks filter. Use staffpicks or omit this parameter.');
    }

    if (staffpicks) {
        sortParams += '&filter=conditional_featured';
        feedTitle += `: ${category} staffpicks`;
    }

    const url = `https://api.vimeo.com/categories/${categoryParams}/videos?page=1&per_page=18${sortParams}`;
    const tokenResponse = await got({
        method: 'get',
        url: 'https://vimeo.com/_rv/viewer',
    });
    const vimeoAuthorization = tokenResponse.data.jwt;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Authorization: `jwt ${vimeoAuthorization}`,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
    });

    const videos = response.data.data;

    const feedLink = `https://vimeo.com/categories/${category}/videos/sort:latest`;
    const staffPicksQuery = '?staffpicked=true';
    const feedDescription = await cache.tryGet(feedLink + (staffpicks ? staffPicksQuery : ''), async () => {
        const response = await got({
            url: feedLink + (staffpicks ? staffPicksQuery : ''),
        });
        const description = load(response.data);
        return description('meta[name="description"]').attr('content') ?? '';
    });

    return {
        title: `${feedTitle} | Vimeo category`,
        link: feedLink + (staffpicks ? staffPicksQuery : ''),
        description: feedDescription,
        item: videos.map((item) => ({
            title: item.name,
            description: renderDescription({
                videoUrl: item.uri.replace('/videos', ''),
                vdescription: item.description || '',
            }),
            pubDate: item.created_time ? parseDate(item.created_time) : undefined,
            updated: item.modified_time && Number.isFinite(Date.parse(item.modified_time)) ? parseDate(item.modified_time) : undefined,
            link: item.link,
            image: item.pictures?.sizes?.at(-1)?.link,
            author: item.user.name,
            category: [...(item.categories ?? []).map((category) => category.name), ...(item.tags ?? []).map((tag) => tag.name)],
        })),
    };
}
