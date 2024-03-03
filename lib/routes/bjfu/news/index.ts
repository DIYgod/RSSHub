// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const util = require('./utils');
const iconv = require('iconv-lite');

export default async (ctx) => {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'xydt':
            title = '校园动态';
            path = 'lsxy/';
            break;
        case 'jxky':
            title = '教学科研';
            path = 'jxky/';
            break;
        case 'djsz':
            title = '党建思政';
            path = 'djsz/';
            break;
        case 'yzph':
            title = '一周排行';
            path = 'yzph/';
            break;
        case 'lsyw':
        default:
            title = '绿色要闻';
            path = 'lsyw/';
    }
    const base = 'http://news.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        responseType: 'buffer',
        url: base,
    });

    const data = response.data;
    let $ = load(iconv.decode(data, 'utf-8'));
    const charset = $('meta[http-equiv="Content-Type"]')
        .attr('content')
        .match(/charset=(.*)/)?.[1];
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(data, charset ?? 'utf-8'));
    }

    const list = $('.news_ul li').slice(0, 12).toArray();

    const result = await util.ProcessFeed(base, list, cache); // 感谢@hoilc指导

    ctx.set('data', {
        title: '北林新闻- ' + title,
        link: 'http://news.bjfu.edu.cn/' + path,
        description: '绿色新闻网 - ' + title,
        item: result,
    });
};
