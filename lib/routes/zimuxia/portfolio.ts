import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
const allowlinktypes = new Set(['all', 'magnet', 'ed2k', 'baidu', 'subhd', 'quark', '115']);

export const route: Route = {
    path: '/portfolio/:id',
    categories: ['multimedia'],
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
    radar: [
        {
            source: ['zimuxia.cn/portfolio/:id'],
        },
    ],
    name: '剧集',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
本路由以 \`magnet\` 为默认 linktype，可以通过在路由后方加上 \`?linktype=链接类型\` 指定导出的链接类型。比如路由为 [\`/zimuxia/portfolio/我们这一天?linktype=baidu\`](https://rsshub.app/zimuxia/portfolio/我们这一天?linktype=baidu) 来导出百度盘链接。目前，你可以选择的 \`链接类型\` 包括: \`magnet\`(默认), \`all\`(所有), \`ed2k\`(电驴), \`baidu\`(百度盘), \`quark\`(夸克盘), \`115\`(115 盘), \`subhd\`(字幕).
:::`,
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
        .filter((_, el) => $(el).attr('href')?.match(new RegExp(linktype)))
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
