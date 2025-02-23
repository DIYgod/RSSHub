import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const baseApiUrl = 'https://api.hashnode.com';

export const route: Route = {
    path: '/blog/:username',
    categories: ['blog'],
    example: '/hashnode/blog/inklings',
    parameters: { username: '博主名称，用户头像 URL 中找到' },
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
            source: ['hashnode.dev/'],
        },
    ],
    name: '用户博客',
    maintainers: ['hnrainll'],
    handler,
    url: 'hashnode.dev/',
    description: `::: tip
  username 为博主用户名，而非\`xxx.hashnode.dev\`中\`xxx\`所代表的 blog 地址。
:::`,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    if (!username) {
        return;
    }

    const query = `
    {
        user(username: "${username}") {
            publication {
                posts{
                    slug
                    title
                    brief
                    coverImage
                    dateAdded
                }
            }
        }
    }
    `;

    const userUrl = `https://${username}.hashnode.dev`;
    const response = await got({
        method: 'POST',
        url: baseApiUrl,
        headers: {
            Referer: userUrl,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    const publication = response.data.data.user.publication;
    if (!publication) {
        return;
    }

    const list = publication.posts;
    return {
        title: `Hashnode by ${username}`,
        link: userUrl,
        item: list
            .map((item) => ({
                title: item.title,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: item.coverImage,
                    brief: item.brief,
                }),
                pubDate: parseDate(item.dateAdded),
                link: `${userUrl}/${item.slug}`,
            }))
            .filter((item) => item !== ''),
    };
}
