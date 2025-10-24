import { Route, ViewType } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/doodles/:language?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/google/doodles/zh-CN',
    parameters: { language: 'Language, default to `zh-CN`, for other language values, you can get it from [Google Doodles official website](https://www.google.com/doodles)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Update',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    const { language = 'zh-CN' } = ctx.req.param();
    const current = new Date();
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const link = `https://www.google.com/doodles?hl=${language}`;

    const { data } = await got({
        method: 'get',
        url: `https://www.google.com/doodles/json/${year}/${month}?hl=${language}`,
        headers: {
            Referer: link,
        },
    });

    return {
        title: 'Google Doodles',
        link,
        item:
            data &&
            data.map((item) => {
                const date = `${item.run_date_array[0]}-${item.run_date_array[1]}-${item.run_date_array[2]}`;

                return {
                    title: item.title,
                    description: `<img src="https:${item.url}" /><br>${item.share_text}`,
                    pubDate: new Date(date).toUTCString(),
                    guid: item.url,
                    link: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`,
                };
            }),
    };
}
