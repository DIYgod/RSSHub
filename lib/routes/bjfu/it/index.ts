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
        case 'kydt':
            title = '科研动态';
            path = 'kyxz/kydt/';
            break;
        case 'pydt':
            title = '本科生培养';
            path = 'bkspy/pydt/';
            break;
        case 'pydt2':
            title = '研究生培养';
            path = 'yjspy/pydt2/';
            break;
        default:
            title = '学院新闻';
            path = 'xyxw/';
    }
    const base = 'http://it.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        responseType: 'buffer',
        url: base,
    });

    const data = response.data;
    let $ = load(iconv.decode(data, 'utf-8'));
    const charset = $('meta[charset]').attr('charset');
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(data, charset ?? 'utf-8'));
    }

    const list = $('.item-content').toArray();

    const result = await util.ProcessFeed(base, list, cache); // 感谢@hoilc指导

    ctx.set('data', {
        title: '北林信息 - ' + title,
        link: 'http://it.bjfu.edu.cn/' + path,
        description: '北京林业大学信息学院 - ' + title,
        item: result,
    });
};
