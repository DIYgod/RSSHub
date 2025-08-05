import { Route, ViewType } from '@/types';
import { parseRelativeDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { JSDOM } from 'jsdom';

export const route: Route = {
    path: '/analytic/',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/zhizhuan100/analytic/',
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

    const bodyJsUrl = urlData
        ? ([...new JSDOM(urlData).window.document.querySelectorAll('script[src]')]
              .find((s) => s.getAttribute('src')?.includes('Body.js'))
              ?.getAttribute('src') ?? null)
        : null;

    const responseData = await ofetch(bodyJsUrl?.toString() ?? '', {
        headers: {
            accept: '*/*',
            referer: 'https://www.zhizhuan100.com.cn/',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
        },
        parseResponse: (txt) => txt,
    });

    // 解析HTML内容
    const decodedData = responseData.replaceAll(/\\u([0-9a-fA-F]{4})/g, (match, code) => String.fromCharCode(Number.parseInt(code, 16)));
    // 从document.write()中提取HTML内容
    const htmlMatch = decodedData.match(/document\.write\('(.*)'\);/s);
    if (!htmlMatch) {
        throw new Error('无法找到HTML内容');
    }

    // 解码转义字符
    const htmlContent = htmlMatch[1]
        .replaceAll(String.raw`\r\n`, '\n')
        .replaceAll(String.raw`\'`, "'")
        .replaceAll(String.raw`\"`, '"')
        .replaceAll('\\\\', '\\');

    // 使用JSDOM解析HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 查找所有报告项目
    const listItems = document.querySelectorAll('.w-list-item');

    const items = [...listItems]
        .map((item) => {
            const titleElement = item.querySelector('.w-list-title');
            const dateElement = item.querySelector('.w-list-date');
            const linkElement = item.querySelector('.w-list-link');
            const imgElement = item.querySelector('.w-listpic-in');

            const title = titleElement?.textContent?.trim() || '';
            const dateText = dateElement?.textContent?.trim() || '';
            const href = linkElement?.getAttribute('href') || '';
            const imgSrc = imgElement?.getAttribute('src') || '';

            // 从href中提取ID
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
        .filter((item) => item.title); // 过滤掉没有标题的项目

    return {
        title: `智篆商业-消费报告`,
        link: 'https://www.zhizhuan100.com.cn/analysis',
        allowEmpty: true,
        item: items,
    };
}
