// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
const { getData } = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type');
    const binaryType = type === 'videos' ? 'videos' : 'essays';
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const url = `https://aeon.co/${type}`;
    const { data: response } = await got(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        link: `https://aeon.co/${binaryType}/${item.slug}`,
        pubDate: item.createdAt,
    }));

    const items = await getData(ctx, list);

    ctx.set('data', {
        title: `AEON | ${capitalizedType}`,
        link: url,
        item: items,
    });
};
