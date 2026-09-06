// example usage: `/nature/news-and-comment/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence
import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { baseUrl, cookieJar, getArticle, getArticleList } from './utils';

export const route: Route = {
    path: '/news-and-comment/:journal?',
    categories: ['journal'],
    example: '/nature/news-and-comment/ng',
    parameters: { journal: 'short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['nature.com/latest-news', 'nature.com/news', 'nature.com/'],
            target: '/news',
        },
    ],
    name: 'News & Comment',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `|   \`:journal\`  |   Full Name of the Journal  | Route                                                                                              |
| :-----------: | :-------------------------: | -------------------------------------------------------------------------------------------------- |
|      nbt      |     Nature Biotechnology    | [/nature/news-and-comment/nbt](https://rsshub.app/nature/news-and-comment/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/news-and-comment/neuro](https://rsshub.app/nature/news-and-comment/neuro)                 |
|       ng      |       Nature Genetics       | [/nature/news-and-comment/ng](https://rsshub.app/nature/news-and-comment/ng)                       |
|       ni      |      Nature Immunology      | [/nature/news-and-comment/ni](https://rsshub.app/nature/news-and-comment/ni)                       |
|     nmeth     |        Nature Method        | [/nature/news-and-comment/nmeth](https://rsshub.app/nature/news-and-comment/nmeth)                 |
|     nchem     |       Nature Chemistry      | [/nature/news-and-comment/nchem](https://rsshub.app/nature/news-and-comment/nchem)                 |
|      nmat     |       Nature Materials      | [/nature/news-and-comment/nmat](https://rsshub.app/nature/news-and-comment/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/news-and-comment/natmachintell](https://rsshub.app/nature/news-and-comment/natmachintell) |

- Using router (\`/nature/research/\` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
- The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals`,
    url: 'nature.com/latest-news',
};

async function handler(ctx) {
    const journal = ctx.req.param('journal');
    const pageURL = `${baseUrl}/${journal}/news-and-comment`;

    const pageResponse = await got(pageURL, { cookieJar });
    const pageCapture = load(pageResponse.data);
    const pageDescription = pageCapture('meta[name=description]').attr('content') || 'Nature, a nature research journal';

    let items = getArticleList(pageCapture);

    items = await Promise.all(items.map((item) => getArticle(item)));

    return {
        title: pageCapture('title').text(),
        description: pageDescription,
        link: pageURL,
        item: items,
    };
}
