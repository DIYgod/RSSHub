// @ts-nocheck
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';

export default async (ctx) => {
    const response = await got('https://m.thepaper.cn');
    const data = JSON.parse(load(response.data)('#__NEXT_DATA__').html());
    const list = [...data.props.pageProps.data.list, ...data.props.pageProps.topData.recommendImg];

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.set('data', {
        title: '澎湃新闻 - 首页头条',
        link: 'https://m.thepaper.cn',
        item: items,
        itunes_author: '澎湃新闻',
        image: utils.ExtractLogo(response),
    });
};
