// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://www.pingwest.com';
    const url = `${baseUrl}/api/state/list`;
    const response = await got(url, {
        searchParams: {
            page: 1,
        },
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data.data.list);
    const items = $('section.item')
        .toArray()
        .map((ele) => {
            const timestamp = ele.attribs['data-t'];
            const $item = load(ele);
            const rightNode = $item('.news-info');
            const tag = rightNode.find('.item-tag-list').text();
            const title = rightNode.find('.title').text();
            const link = rightNode.find('a').last().attr('href');
            let description = rightNode.text();
            const imgUrl = $item('.news-img img');
            if (imgUrl.length) {
                imgUrl.attr('src', imgUrl.attr('src').split('?x-')[0]);
                description += `<br>${imgUrl.parent().html()}`;
            }
            return {
                title: title || tag,
                link: link.startsWith('http') ? link : `https:${link}`,
                description,
                pubDate: parseDate(timestamp, 'X'),
                category: tag,
            };
        });

    ctx.set('data', {
        title: '品玩 - 实时要闻',
        description: '品玩 - 实时要闻',
        link: `${baseUrl}/status`,
        item: items,
    });
};
