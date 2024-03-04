// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
const { getData } = require('./utils');

export default async (ctx) => {
    const url = `https://aeon.co/${ctx.req.param('category')}`;
    const { data: response } = await got(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.section.articles.edges.map((item) => ({
        title: item.node.title,
        author: item.node.authors.map((author) => author.displayName).join(', '),
        link: `https://aeon.co/${item.node.type.toLowerCase()}s/${item.node.slug}`,
        pubDate: item.node.createdAt,
    }));

    const items = await getData(ctx, list);

    ctx.set('data', {
        title: `AEON | ${data.props.pageProps.section.title}`,
        link: url,
        description: data.props.pageProps.section.metaDescription,
        item: items,
    });
};
