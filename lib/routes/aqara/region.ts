import type { Route } from '@/types';

export const route: Route = {
    path: '/:region/:type?',
    categories: ['other'],
    example: '/aqara/en/news',
    parameters: {
        region: '地区 id，可在对应新闻页 URL 中找到，默认为 en，即 Global',
        type: '类型，见下表，默认为 news，即新闻',
    },
    description: `| 中国 / 大陆 | 대한민국 | Europe | United States | Russia | Global |
| ----------- | -------- | ------ | ------------- | ------ | ------ |
| cn          | kr       | eu     | us            | ru     | en     |

| 新闻 | 博客 |
| ---- | ---- |
| news | blog |`,
    name: '新闻、博客',
    maintainers: ['nczitzk'],
    handler,
};

function handler(ctx) {
    const types = {
        news: 'press-release',
        blog: 'article',
    };

    const { region = 'en', type = 'news' } = ctx.req.param();
    const redirectTo = `/aqara/${region}/category/${types[type]}`;
    return ctx.set('redirect', redirectTo);
}
