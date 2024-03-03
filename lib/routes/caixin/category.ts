// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { parseArticle } = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category');
    const column = ctx.req.param('column');
    const url = `https://${column}.caixin.com/${category}`;
    if (!isValidHost(column)) {
        throw new Error('Invalid column');
    }

    const response = await got(url);

    const $ = load(response.data);
    const title = $('head title').text();
    const entity = JSON.parse(
        $('script')
            .text()
            .match(/var entity = ({.*?})/)[1]
    );

    const {
        data: { datas: data },
    } = await got('https://gateway.caixin.com/api/extapi/homeInterface.jsp', {
        searchParams: {
            subject: entity.id,
            type: 0,
            count: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25,
            picdim: '_266_177',
            start: 0,
        },
    });

    const list = data.map((item) => ({
        title: item.desc,
        description: item.summ,
        link: item.link.replace('http://', 'https://'),
        pubDate: timezone(parseDate(item.time), +8),
        category: item.keyword.split(' '),
        audio: item.audioUrl,
        audio_image_url: item.pict.imgs[0].url,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title,
        link: url,
        description: '财新网 - 提供财经新闻及资讯服务',
        item: items,
    });
};
