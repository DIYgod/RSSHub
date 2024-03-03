// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    // http://rail.ally.net.cn/sitemap.html
    const { category, topic } = ctx.req.param();
    const rootUrl = 'http://rail.ally.net.cn';
    const pageUrl = category ? (topic ? `${rootUrl}/html/${category}/${topic}/` : `${rootUrl}/html/${category}/`) : rootUrl;

    const response = await got.get(pageUrl);
    const $ = load(response.data);
    let title = $('.container .regsiter a') // what a typo...
        .get()
        .slice(1) // drop "首页"
        .reduce((prev, curr) => (prev ? `${prev} - ${$(curr).text()}` : $(curr).text()), '');
    title = title || (category && topic ? `${category} - ${topic}` : category) || '首页';
    let links = [
        // list page: http://rail.ally.net.cn/html/lujuzixun/
        $('.left .hynewsO h2 a').get(),
        // multi-sub-topic page: http://rail.ally.net.cn/html/hyzix/
        $('.left .list_content_c').find('.new_hy_focus_con_tit a, .new_hy_list_name a').get(),
        // multi-sub-topic page 2: http://rail.ally.net.cn/html/foster/
        $('.left').find('.nnewslistpic a, .nnewslistinfo dd a').get(),
        // data list page: http://rail.ally.net.cn/html/tongjigongbao/
        $('.left .list_con .datacountTit a').get(),
        // home page: http://rail.ally.net.cn
        $('.container_left').find('dd a, h1 a, ul.slideshow li a').get(),
    ].flat();
    if (!links.length) {
        // try aggressively sniffing links, e.g. http://rail.ally.net.cn/html/InviteTen/
        links = $('.left a, .container_left a').get();
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
        .filter(Boolean)
        .reduce((prev, curr) => (prev.length && prev.at(-1).link === curr.link ? prev : [...prev, curr]), [])
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, ctx.req.query('limit') || 20);

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

    ctx.set('data', {
        title: `世界轨道交通资讯网 - ${title}`,
        link: pageUrl,
        item: items,
        description: $('head > meta[name="description"]').attr('content'),
    });
};
