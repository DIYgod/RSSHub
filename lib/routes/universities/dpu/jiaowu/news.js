import got from '~/utils/got.js';
import iconv from 'iconv-lite';
import cheerio from 'cheerio';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const resolve_url = require('url').resolve;

const base_url = 'http://jiaowu.dlpu.edu.cn';

const map = {
    2: '/more/2',
    3: '/more/3',
    4: '/more/4',
};

export default async (ctx) => {
    const {
        type = '2'
    } = ctx.params;
    const link = `${base_url}${map[type]}`;

    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));

    ctx.state.data = {
        link,
        title: $('#more>h1').text(),
        item: $('.more_list>li')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date(
                    $('a>span', elem)
                        .text()
                        .replace(/.(\d+)年(\d+)月(\d+)日./, '$1-$2-$3')
                ).toUTCString(),
            }))
            .get(),
    };
};
