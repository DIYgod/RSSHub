import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/news',
    example: '/popyard/news',
    name: '即时快递',
    categories: ['traditional-media'],
    maintainers: ['DIYgod'],
    radar: [{ source: ['cn.popyard.space/'], target: '/news' }],
    handler,
};

async function handler(ctx) {
    const link = 'https://cn.popyard.space/';
    const response = await ofetch(link);
    const $ = load(response);
    const workerUrl = $('#url_worker').text();
    const origin = $('#top_name').text();
    const language = $('#top_language').text();
    const redirection = $('#top_red').text();
    const newsUrl = $('#top_url_news').text();
    const mode = $('#top_url_mode').text();
    const data = await ofetch(`${workerUrl}/cgi-mod/worker.cgi`, { query: { origin, op: 'gate', lan: language, r: redirection } });
    const limit = Math.min(Number(ctx.req.query('limit')) || 30, data.total_justin);
    const items = Array.from({ length: limit }, (_, index) => {
        const sourceId = data[`justin_sid_${index}`];
        const articleId = data[`justin_nid_${index}`];
        return {
            title: data[`justin_sub_${index}`],
            link: mode === '1' ? `${newsUrl}/${language}${sourceId}scroll${articleId}${redirection}.html` : `${newsUrl}/cgi-mod/scroll.cgi?lan=${language}&r=${redirection}&sid=${sourceId}&rid=${articleId}`,
            author: data[`justin_aut_${index}`] || undefined,
        };
    });
    return { title: '八阕 - 即时快递', link, language: 'zh-CN' as const, item: items };
}
