import got from '~/utils/got.js';
import iconv from 'iconv-lite';
import cheerio from 'cheerio';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const resolve_url = require('url').resolve;

const base_url = 'http://news.dlmu.edu.cn';

const map = {
    hdyw: '/hdyw.htm',
    mthd: '/mthd.htm',
    zhxw: '/zhxw.htm',
    yxfc: '/yxfc.htm',
    hdxb: '/hdxb.htm',
    llyd: '/llyd.htm',
    hdjt: '/hdjt.htm',
    ywhc: '/ywhc.htm',
};
export default async (ctx) => {
    const {
        type
    } = ctx.params;
    const link = map.hasOwnProperty(type) ? `${base_url}${map[type]}` : `${base_url}/hdyw.htm`;
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'utf-8'));
    ctx.state.data = {
        link: base_url,
        title: '大连海事大学新闻',
        item: $('.n-Box .n-right .n-pic-box .n-news dl')
            .slice(0, 10)
            .map((_, element) => ({
                link: resolve_url(base_url, $('dd a', element).attr('href')),
                title: $('dd a', element).text(),
                description: $('dd p', element).text(),
                pubDate: new Date($('i', element).text().slice(1, -1)),
            }))
            .get(),
    };
};
