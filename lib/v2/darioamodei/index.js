import got from '@/utils/got';
import cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async function darioamodeiHandler(ctx) {
    const rootUrl = 'https://darioamodei.com';
    
    const response = await got(rootUrl);
    const $ = cheerio.load(response.data);

    // 获取文章列表
    const items = $('.essay')
        .map((_, essay) => {
            const $essay = $(essay);
            const $title = $essay.find('h3');
            const $link = $essay.find('a').first();
            const dateStr = $essay.find('span').first().text().trim();
            // 获取文章详情页
            const articleUrl = new URL($link.attr('href'), rootUrl).href;
            return {
                title: $title.text().trim(),
                link: articleUrl,
                // 暂时使用文章预览作为描述，后续可以抓取详情页获取完整内容
                description: $essay.find('p').text().trim(),
                // 解析日期，格式如 "March 2024"
                pubDate: parseDate(dateStr, 'MMMM YYYY'),
            };
        })
        .toArray();

    ctx.state.data = {
        title: 'Dario Amodei - Essays',
        link: rootUrl,
        item: items,
        description: 'Essays from Dario Amodei\'s personal website',
    };
}