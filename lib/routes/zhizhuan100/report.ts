import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/analytic',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/zhizhuan100/analytic',
    radar: [
        {
            source: ['www.zhizhuan100.com.cn/analysis'],
        },
    ],
    name: 'analytic',
    maintainers: ['Cedaric'],
    handler,
};

async function handler() {
    const urlData = await ofetch('https://www.zhizhuan100.com.cn/analysis');

    const $ = cheerio.load(urlData);

    const bodyJsUrl: string | undefined = $('script[src*="Body.js"]').attr('src');

    if (!bodyJsUrl) {
        throw new Error('无法找到 Body.js 脚本文件');
    }

    const responseData = await ofetch(bodyJsUrl, {
        parseResponse: (txt) => txt,
    });

    const htmlMatch = responseData.match(/document\.write\('(.*)'\);/s);
    if (!htmlMatch) {
        throw new Error('无法找到HTML内容');
    }

    const htmlContent = JSON.parse(`"${htmlMatch[1]}"`);
    const $content = cheerio.load(htmlContent);

    const listItems = $content('.w-list-item');

    const items = listItems
        .toArray()
        .map((item) => {
            const $item = $content(item);
            const titleElement = $item.find('.w-list-title');
            const dateElement = $item.find('.w-list-date');
            const linkElement = $item.find('.w-list-link');
            const imgElement = $item.find('.w-listpic-in');

            const title = titleElement.text().trim() || '';
            const dateText = dateElement.text().trim() || '';
            const href = linkElement.attr('href') || '';
            const imgSrc = imgElement.attr('src') || '';

            const idMatch = href.match(/\/productinfo\/(\d+)\.html/);
            const id = idMatch ? idMatch[1] : '';

            return {
                title,
                pubDate: parseRelativeDate(dateText),
                link: href.startsWith('http') ? href : `https://www.zhizhuan100.com.cn${href}`,
                description: `<img src="${imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc}" alt="${title}">`,
                guid: id,
            };
        })
        .filter((item) => item.title);

    return {
        title: '智篆商业-消费报告',
        link: 'https://www.zhizhuan100.com.cn/analysis',
        allowEmpty: true,
        item: items,
    };
}
