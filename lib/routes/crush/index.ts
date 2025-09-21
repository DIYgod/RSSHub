import { type Data, type DataItem, type Route } from '@/types';
import { type CheerioAPI, load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import md5 from '@/utils/md5';

const baseUrl = 'https://www.crush.ninja';

export const route: Route = {
    path: '/pages/:id',
    name: '匿名投稿頁面',
    url: 'www.crush.ninja',
    maintainers: ['Tsuyumi25'],
    example: '/crush/pages/141719909033861',
    parameters: {
        id: {
            description: '頁面 ID 或代稱，例如 `141719909033861` 或 `awkward87poland`',
        },
    },
    radar: [
        {
            source: ['www.crush.ninja/:locale/pages/:id'],
            target: '/pages/:id',
        },
    ],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { id } = ctx.req.param();
    const targetUrl = `${baseUrl}/en-us/pages/${id}/`;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);

    const title = $('meta[property="og:title"]').attr('content') || `CrushNinja - ${id}`;
    const description = $('meta[name="description"]').attr('content') ?? undefined;
    const image = $('meta[property="og:image"]').attr('content') ?? undefined;

    const items: DataItem[] = $('div.rounded-border')
        .toArray()
        .map((el): DataItem => {
            const $el = $(el);

            const p1 = $el.find('.p-1').first();
            const description = (p1.text() || '').trim();

            const publishedDiv = $el.children('div').last();
            const publishedRaw = (publishedDiv.text() || '').trim();

            // Example
            // Published at: September 20, 2025 12:44:36 PM
            const postedAtText = publishedRaw.replace('Published at: ', '');
            const pubDate = timezone(parseDate(postedAtText), 0);

            const guid = `${targetUrl}#${md5(description)}`;

            const item: DataItem = {
                title: description,
                description,
                pubDate,
                guid,
            };

            return item;
        });

    return {
        title,
        description,
        link: targetUrl,
        item: items,
        image,
        allowEmpty: true,
    };
}
