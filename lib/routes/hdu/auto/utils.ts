import { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://auto.hdu.edu.cn';

export const fetchAutoNews = async (path: string, title: string): Promise<Data> => {
    const link = `${BASE_URL}/${path}`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.rightlist')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const $a = $item.find('.newstitle a');
            const href = $a.attr('href');
            const title = $a.text().trim();
            const dateMatch = $item
                .find('.newsinfo')
                .text()
                .match(/日期：(\d{4}\/\d{2}\/\d{2})/);
            const brief = $item.find('.newsbrief').text().trim();

            return {
                title: title || '无标题',
                link: href ? new URL(href, BASE_URL).href : BASE_URL,
                pubDate: dateMatch ? parseDate(dateMatch[1], 'YYYY/MM/DD') : undefined,
                description: brief || '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $detail = load(data);
                const description = $detail('.wp_articlecontent').html();
                return { ...item, description: description || item.description };
            })
        )
    );

    return {
        title: `杭州电子科技大学自动化学院 - ${title}`,
        link,
        item: items as DataItem[],
    };
};
