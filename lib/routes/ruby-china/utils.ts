import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const RUBY_CHINA_HOST = 'https://ruby-china.org';

async function loadAndParseTopic(link: string) {
    const response = await ofetch(link);
    const $ = load(response);

    const date = $('.topic-detail .timeago').attr('title');

    return {
        author: $('.topic-detail .user-name[data-author="true"]').text(),
        description: $('.topic-detail .card-body').html(),
        pubDate: date ? parseDate(date) : undefined,
    };
}

export function processTopics2Feed(list: Element[]) {
    return pMap(
        list,
        async (item) => {
            const $ = load(item);
            const titleElement = $('.title a');
            const itemUrl = new URL(titleElement.attr('href')!, RUBY_CHINA_HOST).href;
            const detail = await cache.tryGet(itemUrl, () => loadAndParseTopic(itemUrl));

            return { ...detail, title: titleElement.attr('title') || titleElement.text(), link: itemUrl, guid: itemUrl };
        },
        { concurrency: 3 }
    );
}
