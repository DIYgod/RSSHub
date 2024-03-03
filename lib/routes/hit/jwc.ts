// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://jwc.hit.edu.cn';
const type = (filename) => filename.split('.').pop();

export default async (ctx) => {
    const response = await got(`${baseUrl}/2591/list.htm`);

    const { data } = response;
    const $ = load(data);
    const links = $('.news_list li')
        .toArray()
        .map((el) => {
            el = $(el);
            return {
                pubDate: parseDate(el.find('span.fbll').children().first().text().replaceAll('[', '')),
                link: new URL(el.find('a').attr('href'), baseUrl).href,
                title: el.find('a').attr('title'),
            };
        });

    const items = await Promise.all(
        links.map((item) =>
            cache.tryGet(item.link, async () => {
                if (type(item.link) === 'htm') {
                    try {
                        const { data } = await got(item.link);
                        const $ = load(data);

                        const author = $('p.arti_metas>span:nth-child(3)').text().trim();
                        const description =
                            $('div.wp_articlecontent').html() &&
                            $('div.wp_articlecontent')
                                .html()
                                .replaceAll('src="/', `src="${new URL('.', baseUrl).href}`)
                                .replaceAll('href="/', `href="${new URL('.', baseUrl).href}`)
                                .trim();

                        item.author = author;
                        item.description = description;
                    } catch {
                        // intranet
                    }
                } else {
                    // file to download
                    item.description = '此链接为文件，点击以下载';
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '哈尔滨工业大学教务处通知公告',
        link: `${baseUrl}/2591/list.htm`,
        item: items,
    });
};
