import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rail/:category?/:topic?',
    categories: ['new-media'],
    example: '/ally/rail/hyzix/chengguijiaotong',
    parameters: { category: '分类，可在 URL 中找到；略去则抓取首页', topic: '话题，可在 URL 中找到；并非所有页面均有此字段' },
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
            source: ['rail.ally.net.cn/', 'rail.ally.net.cn/html/:category?/:topic?'],
        },
    ],
    name: '世界轨道交通资讯网',
    maintainers: ['Rongronggg9'],
    handler,
    url: 'rail.ally.net.cn/',
    description: `::: tip
  默认抓取前 20 条，可通过 \`?limit=\` 改变。
:::`,
};

async function handler(ctx) {
    // http://rail.ally.net.cn/sitemap.html
    const { category, topic } = ctx.req.param();
    const rootUrl = 'http://rail.ally.net.cn';
    const pageUrl = category ? (topic ? `${rootUrl}/html/${category}/${topic}/` : `${rootUrl}/html/${category}/`) : rootUrl;

    const response = await got.get(pageUrl);
    const $ = load(response.data);
    let title = '';
    const titleLinks = $('.container .regsiter a').toArray().slice(1); // what a typo... drop "首页"
    for (const link of titleLinks) {
        const linkText = $(link).text();
        title = title ? `${title} - ${linkText}` : linkText;
    }
    title = title || (category && topic ? `${category} - ${topic}` : category) || '首页';
    let links = [
        // list page: http://rail.ally.net.cn/html/lujuzixun/
        $('.left .hynewsO h2 a').toArray(),
        // multi-sub-topic page: http://rail.ally.net.cn/html/hyzix/
        $('.left .list_content_c').find('.new_hy_focus_con_tit a, .new_hy_list_name a').toArray(),
        // multi-sub-topic page 2: http://rail.ally.net.cn/html/foster/
        $('.left').find('.nnewslistpic a, .nnewslistinfo dd a').toArray(),
        // data list page: http://rail.ally.net.cn/html/tongjigongbao/
        $('.left .list_con .datacountTit a').toArray(),
        // home page: http://rail.ally.net.cn
        $('.container_left').find('dd a, h1 a, ul.slideshow li a').toArray(),
    ].flat();
    if (!links.length) {
        // try aggressively sniffing links, e.g. http://rail.ally.net.cn/html/InviteTen/
        links = $('.left a, .container_left a').toArray();
    }

    let items = links
        .map((link) => {
            link = $(link);
            const url = link.attr('href');
            const urlMatch = url && url.match(/\/html\/(\d{4})\/\w+_(\d{4})\/\d+\.html/);
            if (!urlMatch) {
                return null;
            }
            const title = link.text();
            return {
                title,
                link: url.startsWith('/') ? `${rootUrl}${url}` : url,
                pubDate: timezone(parseDate(`${urlMatch[1]}${urlMatch[2]}`), 8),
            };
        })
        .filter(Boolean);
    const uniqueItems: DataItem[] = [];
    for (const item of items) {
        if (!uniqueItems.some((uniqueItem) => uniqueItem.link === item?.link)) {
            uniqueItems.push(item!);
        }
    }
    items = uniqueItems.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query('limit') || 20);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                // fix weird format
                let description = '';
                const content = $('div.content_all');
                if (content.length) {
                    content
                        .eq(content.length - 1) // some pages have "summary"
                        .contents()
                        .each((_, child) => {
                            const $child = $(child);
                            let innerHtml;
                            if (child.name === 'div') {
                                innerHtml = $child.html();
                                innerHtml = innerHtml && innerHtml.trim();
                                description += !innerHtml || innerHtml === '&nbsp;' ? (description ? '<br>' : '') : innerHtml;
                            } else {
                                // bare text node or something else
                                description += $child.toString().trim();
                            }
                        });
                } else {
                    // http://rail.ally.net.cn/html/2022/InviteTen_0407/4686.html
                    description = $('div.content div').first().html();
                }

                description = description.replace(/\s*<br ?\/?>\s*$/, ''); // trim <br> at the end
                const info = $('.content > em span');
                return {
                    title: $('.content > h2').text() || item.title,
                    description,
                    // pubDate: timezone(parseDate(info.eq(0).text()), 8),
                    pubDate: item.pubDate,
                    author: info
                        .eq(1)
                        .text()
                        .replace(/^来源：/, ''),
                    link: item.link,
                };
            })
        )
    );

    return {
        title: `世界轨道交通资讯网 - ${title}`,
        link: pageUrl,
        item: items,
        description: $('head > meta[name="description"]').attr('content'),
    };
}
