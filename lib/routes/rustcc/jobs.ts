// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://rustcc.cn';

export default async (ctx) => {
    const jobs_url = 'https://rustcc.cn/section?id=fed6b7de-0a74-48eb-8988-1978858c9b35';

    const response = await got({
        url: jobs_url,
        headers: {
            Referer: base_url,
        },
    });

    const $ = load(response.data);
    const list = $('.article-list li').get();

    ctx.set('data', {
        title: 'Rust语言中文社区 | 招聘',
        link: jobs_url,
        description: `获取Rust语言中文社区的最新招聘`,
        item: await Promise.all(list.map((item) => getFeedItem(item))),
    });
};

function getFeedItem(item) {
    const $ = load(item);
    const title = $('.title');

    return {
        title: title.text(),
        link: `${base_url}${title.attr('href')}`,
        description: $('.info .tags').text(),
        pubDate: timezone(parseDate($('.info .timestamp').text(), 'YYYY-MM-DD hh:mm'), +8),
    };
}
