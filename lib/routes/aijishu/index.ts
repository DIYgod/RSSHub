// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const { type, name = 'newest' } = ctx.req.param();
    const u = name === 'newest' ? `https://aijishu.com/` : `https://aijishu.com/${type}/${name}`;
    const html = await got(u);

    const $ = load(html.data);
    const title = $('title').text();
    const api_path = $('li[data-js-stream-load-more]').attr('data-api-url');

    const channel_url = `https://aijishu.com${api_path}?page=1`;
    const channel_url_resp = await got(channel_url);
    const resp = channel_url_resp.data;
    const list = resp.data.rows;

    const items = await Promise.all(list.filter((item) => item?.url?.startsWith('/a/') || item?.object?.url.startsWith('/a/')).map((item) => utils.parseArticle(item)));

    ctx.set('data', {
        title: title.split(' - ').slice(0, 2).join(' - '),
        link: u,
        item: items,
    });
};
