import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器

import got from '@/utils/got'; // 自订的 got

/**
 * 获取页面内容
 * @param selector 正文CSS选择器
 * @param pageUrl 页面URL
 * @returns {Promise<string|string>} 页面内容，为符合RSS规范的HTML
 */
async function getPageItem(selector, pageUrl) {
    const response = await got({
        method: 'get',
        url: pageUrl,
        https: { rejectUnauthorized: false },
    });
    const $ = load(response.data);
    const page = $(selector);
    return page ? page.html() : '无法获取内容';
}

/**
 * 获取页面内容、标题、日期
 * @param selector 正文CSS选择器
 * @param pageUrl 页面URL
 * @param titleSelector 标题CSS选择器
 * @param dateSelector 日期CSS选择器
 * @param dateHander 日期处理函数，在CMS系统中会以“日期：点击数”等特殊格式显示日期，需要处理切分出日期
 * @returns {Promise<{date, pageInfo: string, title: (*|jQuery|string)}|{date: string, pageInfo: string, title: string}>} 页面内容、标题、日期
 */
async function getPageDetails(selector, pageUrl, titleSelector, dateSelector, dateHander = (date) => date) {
    const response = await got({
        method: 'get',
        url: pageUrl,
        https: { rejectUnauthorized: false },
    });
    const $ = load(response.data);
    const page = $(selector);
    const date = dateHander($(dateSelector).text());
    const title = $(titleSelector).text();
    return page
        ? { pageInfo: page.html(), date, title }
        : {
              pageInfo: '无法获取内容',
              date: '1970-1-1',
              title: '无法获取标题',
          };
}
const getPageItemAndDate = getPageDetails;

export { getPageItem, getPageItemAndDate };
