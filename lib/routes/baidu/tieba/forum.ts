import { Route } from '@/types';

import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: ['/tieba/forum/good/:kw/:cid?/:sortBy?', '/tieba/forum/:kw/:sortBy?'],
    categories: ['bbs'],
    example: '/baidu/tieba/forum/good/女图',
    parameters: { kw: '吧名', cid: '精品分类，默认为 `0`（全部分类），如果不传 `cid` 则获取全部分类', sortBy: '排序方式：`created`, `replied`。默认为 `created`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精品帖子',
    maintainers: ['u3u'],
    handler,
};

async function handler(ctx) {
    // sortBy: created, replied
    const { kw, cid = '0', sortBy = 'created' } = ctx.req.param();

    // PC端：https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}
    // 移动端接口：https://tieba.baidu.com/mo/q/m?kw=${encodeURIComponent(kw)}&lp=5024&forum_recommend=1&lm=0&cid=0&has_url_param=1&pn=0&is_ajax=1
    const params = { kw: encodeURIComponent(kw) };
    ctx.req.path.includes('good') && (params.tab = 'good');
    cid && (params.cid = cid);
    const { data } = await got(`https://tieba.baidu.com/f`, {
        headers: {
            Referer: 'https://tieba.baidu.com/',
        },
        searchParams: params,
    });

    const threadListHTML = load(data)('code[id="pagelet_html_frs-list/pagelet/thread_list"]')
        .contents()
        .filter((e) => e.nodeType === '8');

    const $ = load(threadListHTML.prevObject[0].data);
    const list = $('#thread_list > .j_thread_list[data-field]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const { id, author_name } = item.data('field');
            const time = sortBy === 'created' ? item.find('.is_show_create_time').text().trim() : item.find('.threadlist_reply_date').text().trim();
            const title = item.find('a.j_th_tit').text().trim();
            const details = item.find('.threadlist_abs').text().trim();
            const medias = item
                .find('.threadlist_media img')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    return `<img src="${item.attr('bpic')}">`;
                })
                .join('');

            return {
                title,
                description: art(path.join(__dirname, '../templates/forum.art'), {
                    details,
                    medias,
                    author_name,
                }),
                pubDate: timezone(parseDate(time, ['HH:mm', 'M-D', 'YYYY-MM'], true), +8),
                link: `https://tieba.baidu.com/p/${id}`,
            };
        });

    return {
        title: `${kw}吧`,
        description: load(data)('meta[name="description"]').attr('content'),
        link: `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
        item: list,
    };
}
