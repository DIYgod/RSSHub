// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type');
    const link = `https://developer.aliyun.com/group/${type}`;

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    // 使用 cheerio 加载返回的 HTML
    const $ = load(data);
    const title = $('div[class="header-information-title"]')
        .contents()
        .filter(function () {
            return this.nodeType === 3;
        })
        .text()
        .trim();
    const desc = $('div[class="header-information"]').find('span').last().text().trim();
    const list = $('ul[class^="content-tab-list"] > li');

    ctx.set('data', {
        title: `阿里云开发者社区-${title}`,
        link,
        description: desc,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const desc = item.find('.question-desc');
                    const description = item.find('.browse').text() + ' ' + desc.find('.answer').text();
                    return {
                        title: item.find('.question-title').text().trim() || item.find('a p').text().trim(),
                        link: item.find('a').attr('href'),
                        pubDate: parseDate(item.find('.time').text()),
                        description,
                    };
                })
                .get(),
    });
};
