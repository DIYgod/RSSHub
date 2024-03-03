// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://www.safe.gov.cn';

const zxfkCategoryApis = {
    // 业务咨询 https://www.safe.gov.cn/<site>/ywzx/index.html
    ywzx: 'www/busines/businessQuery?siteid=',

    // 投诉建议 https://www.safe.gov.cn/<site>/tsjy/index.html
    tsjy: 'www/complaint/complaintQuery?siteid=',
};

const processZxfkItems = async (site = 'beijing', category = 'ywzx', limit = '3') => {
    const apiUrl = new URL(`${zxfkCategoryApis[category]}${site}`, rootUrl).href;
    const currentUrl = new URL(`${site}/${category}/index.html`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    const items = $('#complaint')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const spans = item.find('span[objid]');

            const message = {
                author: spans.first().text().replace(/:$/, ''),
                content: spans.eq(1).text(),
                date: spans.eq(2).text(),
            };

            const reply = {
                author: spans.eq(3).text().replace(/:$/, ''),
                content: spans.eq(4).text(),
                date: spans.eq(5).text(),
            };

            return {
                title: `${message.author}: ${message.content}`,
                link: currentUrl,
                description: art(path.join(__dirname, 'templates/message.art'), {
                    message,
                    reply,
                }),
                author: `${message.author}/${reply.author}`,
                guid: `${currentUrl}#${message.author}(${message.date})/${reply.author}(${reply.date})`,
                pubDate: parseDate(message.date),
                updated: parseDate(reply.date),
            };
        });

    const { data: currentResponse } = await got(currentUrl);

    const content = load(currentResponse);

    const author = content('meta[name="ColumnName"]').prop('content');
    const subtitle = content('meta[name="ColumnType"]').prop('content');

    const imagePath = 'safe/templateresource/372b1dfdab204181b9b4f943a8e926a6';
    const image = new URL(`${imagePath}/logo_06.png`, rootUrl).href;
    const icon = new URL(`${imagePath}/safe.ico`, rootUrl).href;

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: content('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};

module.exports = {
    processZxfkItems,
};
