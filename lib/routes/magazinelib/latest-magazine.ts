// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

const host = 'https://magazinelib.com';
export default async (ctx) => {
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
        const data = {};
        data.date = obj.date_gmt;
        data.link = obj.link;
        data.featuredMediaLink = obj._links['wp:featuredmedia'][0].href;
        data.title = obj.title.rendered;
        const $ = load(obj.content.rendered);
        const content = $('.vk-att');
        content.find('img[src="https://magazinelib.com/wp-includes/images/media/default.png"]').remove();
        data.content = content.html();
        const imgUrl = obj._embedded['wp:featuredmedia'][0].source_url;
        data.description = data.content + art(path.join(__dirname, 'templates/magazine-description.art'), { imgUrl });
        data.categories = obj._embedded['wp:term'][0].map((item) => item.name);
        return data;
    });

    ctx.set('data', {
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
    });
};
