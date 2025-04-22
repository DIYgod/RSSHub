import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/category/:category/:staffpicks?',
    categories: ['social-media', 'popular'],
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

    const categoryparams = category;
    let sortparams = '&direction=desc&sort=date';
    let feedtitle = category;
    if (staffpicks && staffpicks !== 'staffpicks') {
        return;
    }

    if (staffpicks) {
        sortparams += '&filter=conditional_featured';
        feedtitle += `: ${category} staffpicks`;
    }

    const url = `https://api.vimeo.com/categories/${categoryparams}/videos?page=1&per_page=18${sortparams}`;
    const tokenresponse = await got({
        method: 'get',
        url: 'https://vimeo.com/_rv/viewer',
    });
    const VimeoAuthorization = tokenresponse.data.jwt;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Authorization: `jwt ${VimeoAuthorization}`,
        },
    });

    const vimeojs = response.data.data;

    const feedlink = `https://vimeo.com/categories/${category}/videos/sort:latest`;
    const feedlinkstaffpicks = '?staffpicked=true';
    const feedDescription = await cache.tryGet(feedlink + (staffpicks ? feedlinkstaffpicks : ''), async () => {
        const response = await got({
            url: feedlink + (staffpicks ? feedlinkstaffpicks : ''),
        });
        const description = load(response.data);
        return description('meta[name="description"]').attr('content');
    });

    return {
        title: `${feedtitle} | Vimeo category`,
        link: feedlink + (staffpicks ? feedlinkstaffpicks : ''),
        description: feedDescription,
        item: vimeojs.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/description.art'), {
                videoUrl: item.uri.replace(`/videos`, ''),
                vdescription: item.description || '',
            }),
            pubDate: parseDate(item.created_time),
            link: item.link,
            author: item.user.name,
        })),
    };
}
