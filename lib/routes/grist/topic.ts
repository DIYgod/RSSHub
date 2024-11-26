import { Route } from '@/types';
import { getData, getList } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media', 'popular'],
    example: '/grist/topic/extreme-heat',
    parameters: { topic: 'Any Topic from Table below' },
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
            source: ['grist.org/:topic'],
        },
    ],
    name: 'Topic',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'grist.org/articles/',
    description: `Topics

  | Topic Name               | Topic Link         |
  | ------------------------ | ------------------ |
  | Accountability           | accountability     |
  | Agriculture              | agriculture        |
  | Ask Umbra                | ask-umbra-series   |
  | Buildings                | buildings          |
  | Cities                   | cities             |
  | Climate & Energy         | climate-energy     |
  | Climate Fiction          | climate-fiction    |
  | Climate of Courage       | climate-of-courage |
  | COP26                    | cop26              |
  | COP27                    | cop27              |
  | Culture                  | culture            |
  | Economics                | economics          |
  | Energy                   | energy             |
  | Equity                   | equity             |
  | Extreme Weather          | extreme-weather    |
  | Fix                      | fix                |
  | Food                     | food               |
  | Grist                    | grist              |
  | Grist News               | grist-news         |
  | Health                   | health             |
  | Housing                  | housing            |
  | Indigenous Affairs       | indigenous         |
  | International            | international      |
  | Labor                    | labor              |
  | Language                 | language           |
  | Migration                | migration          |
  | Opinion                  | opinion            |
  | Politics                 | politics           |
  | Protest                  | protest            |
  | Race                     | race               |
  | Regulation               | regulation         |
  | Science                  | science            |
  | Shift Happens Newsletter | shift-happens      |
  | Solutions                | solutions          |
  | Spanish                  | spanish            |
  | Sponsored                | sponsored          |
  | Technology               | technology         |
  | Temperature Check        | temperature-check  |
  | Uncategorized            | article            |
  | Updates                  | updates            |
  | Video                    | video              |`,
};

async function handler(ctx) {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/categories?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?categories=';
    const topic = ctx.req.param('topic');
    const id = (await getData(`${baseUrl}${searchRoute}${topic}`))[0].id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    return {
        title: `${topic[0].toUpperCase() + topic.slice(1)} - Gist Articles`,
        link: `${baseUrl}/${topic}`,
        item: items,
        description: `${topic[0].toUpperCase() + topic.slice(1)} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
}
