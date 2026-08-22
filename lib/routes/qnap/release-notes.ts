import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/release-notes/:id',
    categories: ['program-update'],
    example: '/qnap/release-notes/qts',
    parameters: { id: 'OS id, see below' },
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    description: `| QTS | QuTS hero  | QuTScloud | QSS | QuWAN Orchestrator  | QES | QVP | QuRouter | TAS | AfoBot |
| --- | ---------- | --------- | --- | ------------------- | --- | --- | -------- | --- | ------ |
| qts | quts\\_hero | qutscloud | qss | quwan\\_orchestrator | qes | qvp | qurouter | tas | afobot |`,
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const rootUrl = 'https://www.qnap.com';
    const currentUrl = `${rootUrl}/en/release-notes/${id}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('.release-notes-content__versions li')
        .toArray()
        .slice(0, 20)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.version-title h4').text().trim(),
                link: $item.find('.version-btn-container a').attr('href'),
                pubDate: parseDate($item.find('.release-note-time').text()),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);

                const content = load(detailResponse);

                item.description = content('.release-notes-content__intro .content').html()!;

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
