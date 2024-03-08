import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://ugs.hrbeu.edu.cn';

const authorMap = {
    gztz: {
        all: '/2821',
    },
    jwc: {
        all: '/jwc',
        jxap: '/2847',
        ksgl: '/2895',
        xjgl: '/2902',
        wytk: '/2897',
        cjgl: '/2901',
    },
    sjjxyjlc: {
        all: '/3206',
        syjx: '/2847',
        sysjs: '/sysjs',
        xwsx: '/2909',
        xwlw: '/2910',
        kcsj: '/2911',
        cxcy: '/2913',
        xjjl: '/xjjl',
    },
    jypgc: {
        all: '/3207',
        jxyjyjxcg: '/2916',
        zljk: '/2917',
    },
    zyjsc: {
        all: '/3208',
        zyyjcjs: '/2914',
        cgsyb: '/2925',
        jxmsyyxzjjs: '/2918',
        ktjs: '/2919',
        syjx: '/2920',
    },
    gjdxswhszjd: {
        all: '/3209',
    },
    jsjxfzzx: {
        all: '/3210',
        jspx: '/2915',
    },
    zhbgs: {
        all: '/3211',
        lxkc: '/lxkc',
    },
};

export const route: Route = {
    path: '/ugs/news/:author?/:category?',
    categories: ['forecast'],
    example: '/hrbeu/ugs/news/jwc/jxap',
    parameters: { author: '发布部门，默认为 `gztz`', category: '分类，默认为 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['ugs.hrbeu.edu.cn/:author/list.htm'],
        target: '/ugs/news/:author',
    },
    name: '本科生院工作通知',
    maintainers: ['XYenon'],
    handler,
};

async function handler(ctx) {
    const author = ctx.req.param('author') || 'gztz';
    const category = ctx.req.param('category') || 'all';
    const link = baseUrl + authorMap[author][category] + '/list.htm';
    const response = await got(link, {
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data);

    const list = $('.wp_article_list_table .border9')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('a').attr('title'),
                link: new URL(e.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(e.find('.date').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('.htm')) {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.description = $('.wp_articlecontent').html().trim();
                } else {
                    item.description = '此链接为文件，请点击下载';
                }
                return item;
            })
        )
    );

    return {
        title: '哈尔滨工程大学本科生院工作通知',
        link,
        item: out,
    };
}
