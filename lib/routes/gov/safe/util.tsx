import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const rootUrl = 'https://www.safe.gov.cn';

const zxfkCategoryApis = {
    // Business inquiries https://www.safe.gov.cn/<site>/ywzx/index.html
    ywzx: 'www/busines/businessQuery?siteid=',

    // Complaints and suggestions https://www.safe.gov.cn/<site>/tsjy/index.html
    tsjy: 'www/complaint/complaintQuery?siteid=',
};

const processZxfkItems = async (site = 'beijing', category = 'ywzx', limit = 3) => {
    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }

    const apiUrl = new URL(`${zxfkCategoryApis[category]}${site}`, rootUrl).href;
    const currentUrl = new URL(`${site}/${category}/index.html`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    const items = $('#complaint')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            const spans = $item.find('span[objid]');

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
                description: renderToString(
                    <div>
                        <p>
                            <b>留言：</b>
                            {message.content}
                        </p>
                        <p>
                            <b>答复：</b>
                            {reply.content}
                        </p>
                    </div>
                ),
                author: `${message.author}/${reply.author}`,
                guid: `${currentUrl}#${message.author}(${message.date})/${reply.author}(${reply.date})`,
                pubDate: message.date ? timezone(parseDate(message.date), 8) : undefined,
                updated: reply.date ? timezone(parseDate(reply.date), 8) : undefined,
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
        language: 'zh' as const satisfies Language,
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
};

export { processZxfkItems };
