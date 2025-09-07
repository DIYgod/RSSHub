import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/latest/:language?',
    categories: ['new-media'],
    example: '/radio-canada/latest',
    parameters: { language: 'Language, see below, English by default' },
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
            source: ['ici.radio-canada.ca/rci/:lang', 'ici.radio-canada.ca/'],
        },
    ],
    name: 'Latest News',
    maintainers: ['nczitzk'],
    handler,
    description: `| Français | English | Español | 简体中文 | 繁體中文 | العربية | ਪੰਜਾਬੀ | Tagalog |
| -------- | ------- | ------- | -------- | -------- | ------- | --- | ------- |
| fr       | en      | es      | zh-hans  | zh-hant  | ar      | pa  | tl      |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://ici.radio-canada.ca';
    const apiRootUrl = 'https://services.radio-canada.ca';
    const currentUrl = `${apiRootUrl}/neuro/sphere/v1/rci/${language}/continuous-feed?pageSize=50`;

    const response = await ofetch(currentUrl);

    const list = response.data.lineup.items.map((item) => ({
        title: item.title,
        category: item.kicker,
        link: `${rootUrl}${item.url}`,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const $ = load(detailResponse);

                const rcState = $('script:contains("window._rcState_ = ")')
                    .text()
                    .match(/window\._rcState_ = (.*);/)?.[1];

                item.description = rcState ? parseDescriptionFromState(rcState) : ($(`div[data-testid="newsStoryMedia"]`).html() ?? '') + ($('article > main').html() ?? '');

                return item;
            })
        )
    );

    return {
        title: response.meta.title,
        link: response.metric.metrikContent.omniture.url,
        item: items,
    };
}

const parseDescriptionFromState = (rcState) => {
    const rcStateJson = JSON.parse(rcState);
    const news = Object.values(rcStateJson?.pages?.pages ?? {})[0] as any;

    const headerImg = news?.data?.newsStory?.headerMultimediaItem?.picture;
    const headerImgUrl = headerImg?.pattern ? headerImg?.pattern.replace('/q_auto,w_{width}', '').replace('{ratio}', '16x9') : '';
    const header = `<figure><picture><img src="${headerImgUrl}" alt="${headerImg?.alt ?? ''}"></picture><figcaption>${headerImg?.legend ?? ''}</figcaption></figure>`;
    const primer = news?.data?.newsStory?.primer?.replaceAll(String.raw`\n`, '') ?? '';
    const body = news?.data?.newsStory?.body?.html?.replaceAll(String.raw`\n`, '') ?? '';
    let bodyWithImg = body;
    for (const [index, attachment] of (news?.data?.newsStory?.body?.attachments ?? []).entries()) {
        const placeholder = `<!--body:attachment:${index}-->`;
        const picture = attachment?.picture;
        const imageUrl = picture?.pattern ? picture?.pattern.replace('/q_auto,w_{width}', '').replace('{ratio}', attachment?.dimensionRatio ?? '16x9') : '';
        bodyWithImg = bodyWithImg.replace(placeholder, `<figure><picture><img src="${imageUrl}" alt="${picture?.alt ?? ''}"></picture><figcaption>${picture?.legend ?? ''}</figcaption></figure>`);
    }
    return header + primer + bodyWithImg;
};
