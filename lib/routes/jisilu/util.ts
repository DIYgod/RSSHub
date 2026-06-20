import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.jisilu.cn';

const processItems: ($: CheerioAPI, targetEl: Cheerio<Element>, limit: number) => Promise<DataItem[]> = async ($: CheerioAPI, targetEl: Cheerio<Element>, limit: number) => {
    const items: DataItem[] = targetEl
        .find('div.aw-item')
        .toArray()
        .map((item): DataItem => {
            const $item: Cheerio<Element> = $(item);

            const aEl: Cheerio<Element> = $item.find('h4 a');

            const title: string = aEl.text();
            const link: string | undefined = aEl.prop('href');

            const pubDateStr: string | undefined = $item
                .find('.aw-text-color-999')
                .text()
                .match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];

            const authorEl: Cheerio<Element> = $item.find('a.aw-user-name');
            const author: DataItem['author'] = authorEl.prop('href')
                ? [
                      {
                          name: authorEl.text(),
                          url: authorEl.prop('href'),
                      },
                  ]
                : authorEl.text();

            return {
                title,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : undefined,
                link,
                category: $item
                    .find('span.aw-question-tags a, a.aw-topic-name')
                    .toArray()
                    .map((c) => $(c).text()),
                author,
            };
        });

    return (
        await Promise.all(
            items.map((item) => {
                if (!item.link && typeof item.link !== 'string') {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.aw-mod-head h1').text();

                    if (!title) {
                        return item;
                    }

                    const isAnswer: boolean = item.link ? /answer_id/.test(item.link) : false;

                    const description: string = (isAnswer ? $$('div.markitup-box').last() : $$('div.markitup-box').first()).html() ?? '';

                    const metaStr: string = $$(isAnswer ? 'div.aw-dynamic-topic-meta' : 'div.aw-question-detail-meta')
                        .find('span.aw-text-color-999')
                        .text();

                    const pubDateStr = metaStr.match(isAnswer ? /(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/ : /发表时间\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];
                    const updatedStr = metaStr.match(/最后修改时间\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];

                    const authorEl: Cheerio<Element> = $$(isAnswer ? 'p.publisher a.aw-user-name' : 'div.aw-side-bar-mod-body a.aw-user-name').first();
                    const author: DataItem['author'] = authorEl.prop('href')
                        ? [
                              {
                                  name: authorEl.text(),
                                  url: authorEl.prop('href'),
                                  avatar: authorEl.parent().parent().find('img').first().prop('src'),
                              },
                          ]
                        : authorEl.text();

                    return {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        link: item.link,
                        category: item.category,
                        author,
                        content: {
                            html: description,
                            text: $$('div.aw-question-detail-txt').first().text(),
                        },
                        updated: updatedStr ? timezone(parseDate(updatedStr), +8) : item.updated,
                    };
                });
            })
        )
    )
        .filter((_): _ is DataItem => true)
        .slice(0, limit);
};

export { processItems, rootUrl };
