import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const rootUrl = 'https://www.56kog.com';

const fetchItems = async (limit, currentUrl, tryGet) => {
    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    let items = $('p.line')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: item.find('span').last().text(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const content = load(iconv.decode(detailResponse, 'gbk'));

                    const details = content('div.mohe-content p')
                        .toArray()
                        .map((detail) => {
                            detail = content(detail);
                            const as = detail.find('a');

                            return {
                                label: detail.find('span.c-l-depths').text().split(/：/)[0],
                                value:
                                    as.length === 0
                                        ? content(
                                              detail
                                                  .contents()
                                                  .toArray()
                                                  .find((c) => c.nodeType === 3)
                                          )
                                              .text()
                                              .trim()
                                        : {
                                              href: new URL(as.first().prop('href'), rootUrl).href,
                                              text: as.first().text().trim(),
                                          },
                            };
                        });

                    const pubDate = details.find((detail) => detail.label === '更新').value;

                    item.title = content('h1').contents().first().text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        images: [
                            {
                                src: new URL(content('a.mohe-imgs img').prop('src'), rootUrl).href,
                                alt: item.title,
                            },
                        ],
                        details,
                    });
                    item.author = details.find((detail) => detail.label === '作者').value;
                    item.category = [details.find((detail) => detail.label === '状态').value, details.find((detail) => detail.label === '类型').value.text].filter(Boolean);
                    item.guid = `56kog-${item.link.match(/\/(\d+)\.html$/)[1]}#${pubDate}`;
                    item.pubDate = timezone(parseDate(pubDate), +8);
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items.filter((item) => item.description).slice(0, limit),
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('div.uni_footer a').text(),
        allowEmpty: true,
    };
};

export { rootUrl, fetchItems };
