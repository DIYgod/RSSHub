import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

const host = 'https://magazinelib.com';
export const route: Route = {
    path: '/latest-magazine/:query?',
    categories: ['reading'],
    example: '/magazinelib/latest-magazine/new+yorker',
    parameters: { query: 'query, search page querystring' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest Magazine',
    maintainers: ['EthanWng97'],
    handler,
    description: `For instance, when doing search at [https://magazinelib.com](https://magazinelib.com) and you get url \`https://magazinelib.com/?s=new+yorker\`, the query is \`new+yorker\``,
};

async function handler(ctx) {
    const query = ctx.req.param('query');
    const url = `${host}/wp-json/wp/v2/posts/`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            search: query,
            per_page: 30,
            _embed: 1,
        },
    });
    let subTitle = query;
    if (subTitle === undefined) {
        subTitle = '';
    } else {
        subTitle = subTitle.replaceAll(/[^\dA-Za-z]+/g, ' ').toUpperCase();
        subTitle = ` - ${subTitle}`;
    }

    const items = response.data.map((obj) => {
        const data = {
            date: obj.date_gmt,
            link: obj.link,
            featuredMediaLink: obj._links['wp:featuredmedia'][0].href,
            title: obj.title.rendered,
        };
        const $ = load(obj.content.rendered);
        const content = $('.vk-att');
        content.find('img[src="https://magazinelib.com/wp-includes/images/media/default.png"]').remove();
        data.content = content.html();
        const imgUrl = obj._embedded['wp:featuredmedia'][0].source_url;
        data.description = data.content + art(path.join(__dirname, 'templates/magazine-description.art'), { imgUrl });
        data.categories = obj._embedded['wp:term'][0].map((item) => item.name);
        return data;
    });

    return {
        title: `MagazineLib - Latest Magazines${subTitle}`,
        link: `{host}/?s=${query}`,
        description: `MagazineLib - Latest Magazines${subTitle}`,
        item: items.map((item) => ({
            title: item.title,
            link: item.link,
            category: item.categories,
            pubDate: new Date(item.pubDate).toUTCString(),
            description: item.description,
        })),
    };
}
