import { Route } from '@/types';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/earthquake',
    name: 'hko earthquake',
    maintainers: ['after9'],
    handler,
    example: 'https://rsshub.app/hko/earthquake',
    categories: ['forecast'],
    description: `来自香港天文台的全球5级以上地震记录`,
};

async function handler() {
    const title = '来自香港天文台的全球5级以上地震记录';
    const link = 'https://www.hko.gov.hk/tc/gts/equake/quake-info.htm';
    const description = '提供經天文台分析的全球5.0級或以上及本地有感的地震資訊。';

    // 导入 puppeteer 工具类并初始化浏览器实例
    const browser = await puppeteer();
    // 打开一个新标签页
    const page = await browser.newPage();
    // 访问目标链接
    const linkUrl = 'https://www.hko.gov.hk/tc/gts/equake/quake-info.htm';
    // ofetch 请求会被自动记录，
    // 但 puppeteer 请求不会
    // 所以我们需要手动记录它们
    logger.http(`Requesting ${linkUrl}`);
    await page.goto(linkUrl, {
        // 指定页面等待载入的时间
        waitUntil: 'domcontentloaded',
    });
    // 获取页面的 HTML 内容
    const response = await page.content();
    // 关闭标签页
    await page.close();

    const $ = load(response);

    const items = $('#tbody_list > tr')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        .slice(0, -1) // 去掉最后一个元素，因为它是footer
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item, index, array) => {
            item = $(item);
            const posHtml = index === array.length - 1 ? '' : item.find('td.td_region .a_mag').html();
            const degree = index === array.length - 1 ? '' : item.find('td.td_mag a').text();
            const pubDate = index === array.length - 1 ? '' : item.find('td.td_region a span').text();
            const position = index === array.length - 1 ? '' : posHtml.split('<br>')[1].replace('.', '').trim();
            return index === array.length - 1
                ? undefined
                : {
                      title: `[震級:${degree}] [地點:${position}]`,
                      pubDate: formatDate(pubDate),
                  };
        })
        .filter((item) => item !== undefined);

    return {
        title,
        link,
        description,
        item: items,
    };
}

function formatDate(originalTimeStr) {
    // 检查输入是否有效
    if (typeof originalTimeStr !== 'string' || originalTimeStr.trim() === '') {
        throw new Error('Invalid input: Please provide a valid date string.');
    }

    // 将 HKT 转换为 UTC
    const parts = originalTimeStr.split(' '); // 分割日期、时间和时区

    if (parts.length !== 3) {
        throw new Error("Invalid format: Expected format is 'DD-MM-YYYY HH:mm TZ'.");
    }

    const [datePart, timePart] = parts;

    // 解析日期和时间
    const [day, month, year] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    // 检查解析结果
    if ([day, month, year, hours, minutes].includes(undefined)) {
        throw new Error('Invalid date, time format. Please ensure they are in proper formats.');
    }

    // 创建一个 UTC 时间
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 8, minutes)); // 减去 8 小时以转换为 UTC

    // 使用 toUTCString 方法将 Date 对象转换为所需的格式
    return utcDate.toUTCString();
}
