import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { DataItem } from '@/types';
export async function handler() {
    const TARGET_URL = 'http://www.njupco.com/news/press';
    const response = await ofetch(TARGET_URL);
    const $ = load(response);
    const items: DataItem[] = await Promise.all(
        $('div.left_con ul li')
            .toArray()
            .map((el): Promise<DataItem> => {
                const $el = $(el);
                const linkUrl = $el.children('b').children('a').attr('href');

                if (linkUrl?.includes('weixin')) {
                    const content = $el.find('div').text();
                    return Promise.resolve({
                        title: $el.find('b > a').text(),
                        link: linkUrl!,
                        pubDate: parseDate($el.find('span').text()),
                        description: `${content} <a href=${linkUrl}>点击阅读微信公众号原文</a>`,
                    });
                } else {
                    const contentUrl = `http://www.njupco.com${linkUrl}`;
                    return ofetch(contentUrl).then((html) => {
                        const $content = load(html);
                        const content = $content('div.content').html() ?? '';
                        const REGEX_DATE = /[1-2][0-9]+-[0-1]?[0-9]-[0-2]?[0-9] [0-2][0-9]:[0-6][0-9]:[0-6][0-9]/;
                        const dateOrigin = $content('div.ny_con').children('h2').text();
                        const dateMatch = dateOrigin.match(REGEX_DATE);

                        return {
                            title: $el.find('b > a').text(),
                            link: linkUrl!,
                            pubDate: dateMatch ? parseDate(dateMatch[0]) : undefined,
                            description: content,
                        };
                    });
                }
            })
    );
    return {
        title: '南京大学出版社',
        link: 'http://www.njupco.com/news/press',
        item: items,
    };
}
