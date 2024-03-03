// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.rccp.pku.edu.cn/mzyt/';

export default async (ctx) => {
    const response = await got(baseUrl);

    const $ = load(response.data);
    ctx.set('data', {
        title: '每周一推 - 北京大学中国政治学研究中心',
        link: baseUrl,
        description: $('meta[name="description"]').attr('content'),
        item: $('li.list')
            .map((index, item) => ({
                title: $(item).find('a').text().trim(),
                description: '',
                pubDate: parseDate($(item).find('span').first().text(), '[YYYY-MM-DD]'),
                link: baseUrl + $(item).find('a').attr('href'),
            }))
            .get(),
    });
};
