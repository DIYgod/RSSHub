// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `/news/breaknews/1/${id}#breaknews`;
    const name = await getLinkName(link);
    const rootUrl = 'https://udn.com';
    const response = await got(`${rootUrl}/api/more?page=1&channelId=1&cate_id=${id}&type=breaknews`);

    const items = await Promise.all(
        response.data.lists.map((item) => {
            let link = item.titleLink.startsWith('http') ? item.titleLink : `${rootUrl}${item.titleLink}`;
            const linkUrl = new URL(link);
            // cleanup query paramter
            linkUrl.query = linkUrl.search = '';
            link = linkUrl.toString();

            return cache.tryGet(link, async () => {
                let result = await got(link);
                // VIP article requires redirection
                // e.g. https://udn.com/news/story/7331/6576320
                const vip = result.data.match(/<script language=javascript>window\.location\.href="(https?:\/\/[^"]+")/);
                if (vip) {
                    result = await got(vip[1]);
                }

                const $ = load(result.data);
                const metadata = $('script[type="application/ld+json"]')
                    .eq(0)
                    .text()
                    .trim()
                    .replaceAll(/[\b\t\n]/g, '');
                const data = metadata.startsWith('[') ? JSON.parse(metadata)[0] : JSON.parse(metadata);
                // e.g. https://udn.com/news/story/7331/6576320
                const content = $('.article-content__editor');
                // e.g. https://udn.com/news/story/7240/6576424
                const body = $('.article-body__editor');

                let description = '';
                if (data.image) {
                    description += art(path.join(__dirname, 'templates/figure.art'), {
                        src: data.image.contentUrl,
                        alt: data.image.name,
                    });
                }
                if (content.length) {
                    description += content.html();
                } else if (body.length) {
                    description += body.html();
                }

                return {
                    title: item.title,
                    author: data.author.name,
                    description,
                    pubDate: timezone(parseDate(item.time.date, 'YYYY-MM-DD HH:mm'), +8),
                    category: [data.articleSection, vip ? $('.article-head li.breadcrumb__item:last > b').text() : $("meta[name='subsection']").attr('content'), ...data.keywords.split(',')],
                    link,
                };
            });
        })
    );

    ctx.set('data', {
        title: `即時${name} - 聯合新聞網`,
        link: `${rootUrl}${link}`,
        description: 'udn.com 提供即時新聞以及豐富的政治、社會、地方、兩岸、國際、財經、數位、運動、NBA、娛樂、生活、健康、旅遊新聞，以最即時、多元的內容，滿足行動世代的需求',
        item: items,
    });
};

const getLinkName = async (link) => {
    const url = 'https://udn.com/news/breaknews';
    const links = await cache.tryGet(url, async () => {
        const result = await got(url);
        const $ = load(result.data);
        const data = $('.cate-list__subheader a')
            .get()
            .map((item) => {
                item = $(item);
                return [item.attr('href'), item.text().trim()];
            });
        return Object.fromEntries(data);
    });
    if (link in links) {
        return links[link];
    }
    return '列表';
};
