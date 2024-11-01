import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

export const route: Route = {
    path: '/tousu',
    name: '黑猫投诉',
    url: 'tousu.sina.com.cn',
    example: '/sina/tousu',
    maintainers: ['JianLinWei1'],
    radar: [
        {
            source: ['tousu.sina.com.cn'],
        },
    ],
    handler,

}


async function handler(ctx) {

    const browser = await puppeteer();

    const page = await browser.newPage();

    const link = 'https://tousu.sina.cn';

    logger.http(`Requesting ${link}`);
    await page.goto(link, {

        waitUntil: 'networkidle2',
    });

    const response = await page.content();

    page.close();
    const $ = load(response);
    const blackcatCons = $('div.blackcat-con').toArray();
    const items = blackcatCons.map((item) => {
        const title = $(item).find('h1.blackcat-hot').text()
        const link = $(item).find('a.box').attr('href')
        const description = $(item).find('p').text() + $(item).find('ul.list').text()
        const author = $(item).find('span.name').text()
        return {
            title: title,
            link: link,
            description: description,
            author: author,
        }
    })
    return {
        title: `黑猫投诉-新浪旗下消费者服务平台`,
        link: `https://tousu.sina.cn`,
        description: `feedId:74988831961543680+userId:74002328552935424`,
        item: items,
    };



}