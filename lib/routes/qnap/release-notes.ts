import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/release-notes/:id',
    categories: ['program-update'],
    example: '/qnap/release-notes/qts',
    parameters: { id: 'OS id, see below' },
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    description: `| QTS | QuTS hero | QuTScloud | QSS | QuWAN Orchestrator | QES | QVP | QuRouter | TAS | AfoBot |
| --- | --------- | --------- | --- | ------------------ | --- | --- | -------- | --- | ------ |
| qts | quts_hero | qutscloud | qss | quwan_orchestrator | qes | qvp | qurouter | tas | afobot |`,
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const rootUrl = 'https://www.qnap.com';
    const currentUrl = `${rootUrl}/en/release-notes/${id}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list: Array<DataItem & { link: string }> = $('.release-notes-content__versions li')
        .slice(0, 20)
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const href = $item.find('.version-btn-container a').attr('href');
            if (!href) {
                return [];
            }
            return {
                title: $item.find('.version-title h4').text(),
                link: new URL(href, currentUrl).href,
                pubDate: parseDate($item.find('.release-note-time').text(), 0),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);
                item.description = content('.release-notes-content__intro .content').html()!;
                return item;
            }),
        { concurrency: 3 }
    );

    return { title: $('head title').text(), link: currentUrl, language: 'en', item: items } satisfies Data;
}
