import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getDetails } from './get-sec-page-data';

const rootUrl = 'https://oreno3d.com';

const sortRename = {
    favorites: '高評価',
    hot: '急上昇',
    latest: '新着',
    popularity: '人気',
};

function getUserUrl(rootUrl, ctx, sort) {
    let userUrl = '';
    // Choose the list URL from the route parameters.
    if (ctx.req.param('keyword')) {
        const keyword = ctx.req.param('keyword');
        userUrl = `${rootUrl}/search?sort=${encodeURIComponent(sort)}&keyword=${encodeURIComponent(keyword)}`;
    } else if (ctx.req.param('characterid')) {
        const characterid = ctx.req.param('characterid');
        userUrl = `${rootUrl}/characters/${characterid}?sort=${encodeURIComponent(sort)}`;
    } else if (ctx.req.param('authorid')) {
        const authorid = ctx.req.param('authorid');
        userUrl = `${rootUrl}/authors/${authorid}?sort=${encodeURIComponent(sort)}`;
    } else if (ctx.req.param('tagid')) {
        const tagid = ctx.req.param('tagid');
        userUrl = `${rootUrl}/tags/${tagid}?sort=${encodeURIComponent(sort)}`;
    } else if (ctx.req.param('originid')) {
        const originid = ctx.req.param('originid');
        userUrl = `${rootUrl}/origins/${originid}?sort=${encodeURIComponent(sort)}`;
    }
    return userUrl;
}
export const route: Route = {
    path: ['/authors/:authorid/:sort/:pagelimit?', '/characters/:characterid/:sort/:pagelimit?', '/origins/:originid/:sort/:pagelimit?', '/search/:keyword/:sort/:pagelimit?', '/tags/:tagid/:sort/:pagelimit?'],
    categories: ['anime'],
    example: '/oreno3d/authors/3189/latest/1',
    parameters: {
        authorid: 'Author id, can be found in URL',
        characterid: 'Character id, can be found in URL',
        originid: 'Origin id, can be found in URL',
        keyword: 'Search keyword',
        tagid: 'Tag id, can be found in URL',
        sort: 'Sort method, see the table above',
        pagelimit: 'Deprecated; only the first page is fetched',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Author Search',
    maintainers: ['xueli_sherryli'],
    handler,
    description: `| favorites | hot | latest | popularity |
| --------- | --- | ------ | ---------- |
| favorites | hot | latest | popularity |`,
};

// Fetch and parse article details.
async function getData(response) {
    const $ = load(response.data);
    // Read the list title and links.
    const title = $('div.g-main-list').find('h1.main-h').text();
    const list = $('a.box[href]');
    const items = await pMap(
        list.toArray(),
        async (item) => {
            // Read the article link.
            const link = new URL($(item).attr('href')!, rootUrl).href;
            // Cache the article details.
            const details = await cache.tryGet(`oreno3d:detail:v5:${link}`, () => getDetails(link));
            // Read the parsed detail fields.
            const thumbnailUrl = details.thumbnailUrl;
            const videoTitle = details.videoTitle;
            const authors = details.authors;
            const origins = details.origins;
            const characters = details.characters;
            const desc = details.desc;
            const iwaraUrl = details.iwaraUrl;
            const articleLink = details.articleLink;
            // Render the article description.
            const description = renderToString(
                <>
                    {thumbnailUrl ? <img src={thumbnailUrl} /> : null}
                    <p>
                        原作：<b>{origins}</b>
                    </p>
                    <p>
                        角色：<b>{characters}</b>
                    </p>
                    <p>简介：</p>
                    <div style="white-space: pre-line;">
                        <b>{desc}</b>
                    </div>
                    <p>
                        iwara链接：
                        <b>
                            <a href={iwaraUrl}>{iwaraUrl}</a>
                        </b>
                    </p>
                    <p>
                        Oreno3D链接：
                        <b>
                            <a href={articleLink}>{articleLink}</a>
                        </b>
                    </p>
                </>
            );
            const title = `${videoTitle} - ${authors}`;
            return {
                title,
                author: authors,
                link: articleLink,
                category: details.tagList,
                description,
            };
        },
        { concurrency: 3 }
    );
    return { items, title };
}

async function handler(ctx) {
    // Read the route parameters.
    const sort = ctx.req.param('sort');
    const userUrl = getUserUrl(rootUrl, ctx, sort);
    const response = await got(userUrl);
    const result = await getData(response);
    // Return the feed.
    return {
        title: `${result.title} - ${sortRename[sort]}(Page 1-1)`,
        link: userUrl,
        item: result.items,
    };
}
