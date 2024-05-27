import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
const baseUrl = 'https://www3.nhk.or.jp';
const apiUrl = 'https://nwapi.nhk.jp';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['traditional-media'],
    example: '/nhk/news/en',
    parameters: { lang: 'Language, see below, `en` by default' },
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
            source: ['www3.nhk.or.jp/nhkworld/:lang/news/list/', 'www3.nhk.or.jp/nhkworld/:lang/news/'],
            target: '/news/:lang',
        },
    ],
    name: 'WORLD-JAPAN - Top Stories',
    maintainers: ['TonyRL'],
    handler,
    description: `| العربية | বাংলা | မြန်မာဘာသာစကား | 中文（简体） | 中文（繁體） | English | Français |
  | ------- | -- | ------------ | ------------ | ------------ | ------- | -------- |
  | ar      | bn | my           | zh           | zt           | en      | fr       |

  | हिन्दी | Bahasa Indonesia | 코리언 | فارسی | Português | Русский | Español |
  | -- | ---------------- | ------ | ----- | --------- | ------- | ------- |
  | hi | id               | ko     | fa    | pt        | ru      | es      |

  | Kiswahili | ภาษาไทย | Türkçe | Українська | اردو | Tiếng Việt |
  | --------- | ------- | ------ | ---------- | ---- | ---------- |
  | sw        | th      | tr     | uk         | ur   | vi         |`,
};

async function handler(ctx) {
    const { lang = 'en' } = ctx.req.param();
    const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v7b/${lang}/outline/list.json`);
    const meta = await got(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);

    let items = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}${item.page_url}`,
        pubDate: parseDate(item.updated_at, 'x'),
        id: item.id,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v6b/${lang}/detail/${item.id}.json`);
                item.category = Object.values(data.data.categories);
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    img: data.data.thumbnails,
                    description: data.data.detail.replace('\n\n', '<br><br>'),
                });
                delete item.id;
                return item;
            })
        )
    );

    return {
        title: `${Object.values(meta.data.config.navigation.header).find((h) => h.keyname === 'topstories')?.name} | NHK WORLD-JAPAN News`,
        link: `${baseUrl}/nhkworld/${lang}/news/list/`,
        item: items,
    };
}
