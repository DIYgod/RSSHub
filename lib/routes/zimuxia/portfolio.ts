import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
const allowlinktypes = new Set(['all', 'magnet', 'ed2k', 'baidu', 'subhd', 'quark', '115']);

export const route: Route = {
    path: '/portfolio/:id',
    categories: ['picture'],
    example: '/zimuxia/portfolio/我们这一天',
    parameters: { id: '剧集名，可在剧集页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['zimuxia.cn/portfolio/:id'],
    },
    name: '剧集',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let linktype = ctx.req.query('linktype') ?? 'magnet';
    linktype = allowlinktypes.has(linktype) ? linktype : 'magnet';
    linktype = linktype === 'all' ? '.' : linktype;

    const rootUrl = 'https://www.zimuxia.cn';
    const currentUrl = `${rootUrl}/portfolio/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    const items = $('a')
        .filter((_, el) => $(el).attr('href')?.match(RegExp(linktype)))
        .toArray()
        .map((item) => {
            item = $(item);
            const tmpstr2match = $.html(item.parent().children()[item.prevAll('br').first().index() + 1]);
            const tmphtml = item
                .parent()
                .contents()
                .toArray()
                .map((item) => $.html($(item)));
            const title = tmphtml[tmphtml.indexOf(tmpstr2match) - 1].trim().replace(/\s.*|&nbsp;.*/, '');

            return {
                link: currentUrl,
                title,
                description: `<p>${item.parent().html()}</p>`,
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
                guid: `${currentUrl}#${title}`,
            };
        })
        .reverse();

    return {
        title: `${$('.content-page-title').text()} - FIX字幕侠`,
        link: currentUrl,
        item: items,
    };
}
