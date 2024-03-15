import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRootUrl, appDetail, X_UA } from './utils';

export const route: Route = {
    path: ['/changelog/:id/:lang?', '/intl/changelog/:id/:lang?'],
    categories: ['game'],
    example: '/taptap/changelog/60809/en_US',
    parameters: { id: '游戏 ID，游戏主页 URL 中获取', lang: '语言，默认使用 `zh_CN`，亦可使用 `en_US`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['taptap.com/app/:id'],
            target: '/changelog/:id',
        },
    ],
    name: '游戏更新',
    maintainers: ['hoilc', 'ETiV'],
    handler,
    description: `#### 语言代码

  | English (US) | 繁體中文 | 한국어 | 日本語 |
  | ------------ | -------- | ------ | ------ |
  | en\_US       | zh\_TW   | ko\_KR | ja\_JP |`,
};

async function handler(ctx) {
    const is_intl = ctx.req.url.indexOf('/intl/') === 0;
    const id = ctx.req.param('id');
    const lang = ctx.req.param('lang') ?? (is_intl ? 'en_US' : 'zh_CN');

    const url = `${getRootUrl(is_intl)}/app/${id}`;

    const app_detail = await appDetail(id, lang, is_intl);

    const app_img = app_detail.app.icon.original_url;
    const app_name = app_detail.app.title;
    const app_description = `${app_name} by ${app_detail.app.developers.map((item) => item.name).join(' & ')}`;

    const response = await got({
        method: 'get',
        url: `${getRootUrl(is_intl)}/webapiv2/apk/v1/list-by-app?app_id=${id}&from=0&limit=10&${X_UA(lang)}`,
        headers: {
            Referer: url,
        },
    });

    const list = response.data.data.list;

    return {
        title: `TapTap 更新记录 ${app_name}`,
        description: app_description,
        link: url,
        image: app_img,
        item: list.map((item) => ({
            title: `${app_name} / ${item.version_label}`,
            description: item.whatsnew.text,
            pubDate: parseDate(item.update_date * 1000),
            link: url,
            guid: item.version_label,
        })),
    };
}
