import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/today',
    categories: ['study'],
    example: '/sou-yun/today',
    name: '诗词日历',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const currentUrl = 'https://sou-yun.cn/AncientToday.aspx';
    const poemUrl = 'https://api.sou-yun.cn/api/RecommendedReading?type=poem&needHtml=true';
    const wordUrl = 'https://api.sou-yun.cn/api/RecommendedReading?type=word';

    const response = await ofetch(currentUrl);
    const poemResponse = await ofetch(poemUrl, { headers: { Accept: 'application/json' } });
    const wordResponse = await ofetch(wordUrl, { headers: { Accept: 'application/json' } });

    const $ = load(response);
    const birthday = $('span.titleHint').parent().html();
    const today = $('input[name="LastSelectedDate"]').attr('value')!;

    return {
        title: '搜韵网 - 诗词日历',
        link: currentUrl,
        item: [
            {
                title: poemResponse.Date,
                link: currentUrl,
                description: `${poemResponse.Content.Text}<br>${birthday}<br>${wordResponse.Content.Text}`,
                pubDate: timezone(parseDate(today), 8),
            },
        ],
    };
}
