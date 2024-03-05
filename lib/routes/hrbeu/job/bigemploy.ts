// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const response = await got('http://job.hrbeu.edu.cn/HrbeuJY/web');

    const $ = load(response.data);

    const list = $('div.articlecontent')
        .map((_, item) => ({
            title: $(item).find('a.bigTitle').text(),
            pubDate: parseDate($(item).find('p').eq(1).text().replace('时间:', '').trim()),
            description: '点击标题，登录查看招聘详情',
            link: $(item).find('a.bigTitle').attr('href'),
        }))
        .get();

    ctx.set('data', {
        title: '大型招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    });
};
