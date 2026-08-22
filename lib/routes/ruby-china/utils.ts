import { load } from 'cheerio';
import type { Element } from 'domhandler';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const RUBY_CHINA_HOST = 'https://ruby-china.org';

async function loadAndParseTopic(link: string) {
    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: $('.topic-detail .title').text(),
        link,
        author: $('.topic-detail .user-name').text(),
        guid: link,
        description: $('.topic-detail .card-body').html(),
        pubDate: parseDate($('.topic-detail .timeago').attr('title')!),
    };
}

export function processTopics2Feed(list: Element[]) {
    return Promise.all(
        list.map((item) => {
            const itemUrl = new URL(load(item)('.title a').attr('href')!, RUBY_CHINA_HOST).href;

            return cache.tryGet(itemUrl, () => loadAndParseTopic(itemUrl));
        })
    );
}
