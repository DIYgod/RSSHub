import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/focustaiwan',
    parameters: { category: '分类，见下表，默认为 news' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `| Latest | Editor's Picks | Photos of the Day |
  | ------ | -------------- | ----------------- |
  | news   | editorspicks   | photos            |

  | Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
  | -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
  | politics | cross-strait | business | society | science & tech | culture | sports |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';

    const rootUrl = 'https://focustaiwan.tw';
    const currentUrl = `${rootUrl}/cna2019api/cna/FTNewsList`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            action: 4,
            category,
            pageidx: 2,
            pagesize: 50,
        },
    });

    const list = response.data.ResultData.Items.map((item) => ({
        title: item.HeadLine,
        link: item.PageUrl,
        category: item.ClassName,
        pubDate: timezone(parseDate(item.CreateTime), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('img').each(function () {
                    content(this).html(`<img src="${content(this).attr('data-src')}">`);
                });

                const image = content('meta[property="og:image"]').attr('content');
                const matches = detailResponse.data.match(/var pAudio_url = "(.*)\.mp3";/);

                if (matches) {
                    item.enclosure_url = matches[1];
                    item.enclosure_type = 'audio/mpeg';
                    item.itunes_item_image = image;
                }

                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    image,
                    description: content('.paragraph').html(),
                });

                return item;
            })
        )
    );

    return {
        title: response.data.ResultData.MetaData.Title,
        link: response.data.ResultData.MetaData.CanonicalUrl,
        item: items,
        itunes_author: 'Focus Taiwan',
        image: 'https://imgcdn.cna.com.tw/Eng/website/img/default.png',
    };
}
