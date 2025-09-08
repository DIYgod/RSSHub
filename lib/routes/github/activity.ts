import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';

const parser = new Parser();

export const route: Route = {
    path: '/activity/:user',
    name: 'User Activities',
    maintainers: ['hyoban'],
    example: '/github/activity/DIYgod',
    categories: ['programming'],
    view: ViewType.Notifications,
    parameters: {
        user: 'GitHub username',
    },
    description: 'Get the activities of a user on GitHub, based on the GitHub official RSS feed',
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
            source: ['github.com/:user'],
            target: '/activity/:user',
        },
    ],
    handler: async (ctx) => {
        const { user } = ctx.req.param();
        const response = (await ofetch(`https://github.com/${user}.atom`)) as Blob;
        const raw = await response.text();
        // <media:thumbnail height="30" width="30" url="https://avatars.githubusercontent.com/u/8266075?s=30&amp;v=4"/>
        const image = raw.match(/<media:thumbnail height="30" width="30" url="(.+?)"/)?.[1];
        const feed = await parser.parseString(raw);
        return {
            title: `${user}'s GitHub activities`,
            link: feed.link,
            image,
            item: feed.items.map((item) => ({
                title: item.title ?? '',
                link: item.link,
                description: sanitizeHtml(item.content?.replace(/href="\/(.+?)"/g, `href="https://github.com/$1"`) ?? '', { allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'] }),
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                author: item.author,
                guid: item.id,
                image,
            })),
            allowEmpty: true,
        };
    },
};
