import { Route } from '@/types';
// example usage: `/nature/research/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
// nature:           Nature
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence

import { load } from 'cheerio';
import got from '@/utils/got';
import { baseUrl, cookieJar, getArticleList, getDataLayer, getArticle } from './utils';

export const route: Route = {
    path: '/research/:journal?',
    categories: ['journal'],
    example: '/nature/research/ng',
    parameters: { journal: 'short name for a journal, `nature` by default' },
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
            source: ['nature.com/:journal/research-articles', 'nature.com/:journal', 'nature.com/'],
            target: '/research/:journal',
        },
    ],
    name: 'Latest Research',
    maintainers: ['y9c', 'TonyRL', 'pseudoyu'],
    handler,
    description: `|   \`:journal\`  |   Full Name of the Journal  | Route                                                                              |
  | :-----------: | :-------------------------: | ---------------------------------------------------------------------------------- |
  |     nature    |            Nature           | [/nature/research/nature](https://rsshub.app/nature/research/nature)               |
  |      nbt      |     Nature Biotechnology    | [/nature/research/nbt](https://rsshub.app/nature/research/nbt)                     |
  |     neuro     |     Nature Neuroscience     | [/nature/research/neuro](https://rsshub.app/nature/research/neuro)                 |
  |       ng      |       Nature Genetics       | [/nature/research/ng](https://rsshub.app/nature/research/ng)                       |
  |       ni      |      Nature Immunology      | [/nature/research/ni](https://rsshub.app/nature/research/ni)                       |
  |     nmeth     |        Nature Method        | [/nature/research/nmeth](https://rsshub.app/nature/research/nmeth)                 |
  |     nchem     |       Nature Chemistry      | [/nature/research/nchem](https://rsshub.app/nature/research/nchem)                 |
  |      nmat     |       Nature Materials      | [/nature/research/nmat](https://rsshub.app/nature/research/nmat)                   |
  | natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](https://rsshub.app/nature/research/natmachintell) |

  -   Using router (\`/nature/research/\` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
      If the \`:journal\` parameter is blank, then latest research of Nature will return.
  -   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
  -   Only abstract is rendered in some researches`,
};

async function handler(ctx) {
    const journal = ctx.req.param('journal') ?? 'nature';
    const pageURL = `${baseUrl}/${journal}/research-articles`;

    const pageResponse = await got(pageURL, { cookieJar });
    const pageCapture = load(pageResponse.data);

    const pageTitle = getDataLayer(pageCapture).content.journal.title;

    let items = getArticleList(pageCapture);

    items = await Promise.all(items.map((item) => getArticle(item)));

    return {
        title: `Nature (${pageTitle}) | Latest Research`,
        description: pageCapture('meta[name="description"]').attr('content') || `Nature, a nature research journal`,
        link: pageURL,
        item: items,
    };
}
