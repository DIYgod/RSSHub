import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { headers, parseItems } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/category_url/:url?/:language?',
    categories: ['multimedia'],
    example: '/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp',
    parameters: { language: 'language, see below', url: 'relative path after `pornhub.com/`, need to be URL encoded' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Video List',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
    description: `**\`language\`**

  Refer to [Pornhub F.A.Qs](https://help.pornhub.com/hc/en-us/articles/360044327034-How-do-I-change-the-language-), English by default. For example:

  -   \`cn\` (Chinese), for Pornhub in China [https://cn.pornhub.com](https://cn.pornhub.com)；

  -   \`jp\` (Japanese), for Pornhub in Japan [https://jp.pornhub.com](https://jp.pornhub.com) etc.`,
};

async function handler(ctx) {
    const { language = 'www', url = 'video' } = ctx.req.param();
    const link = `https://${language}.pornhub.com/${url}`;
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#videoCategory .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('title').first().text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
}
