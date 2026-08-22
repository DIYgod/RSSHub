import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { solveWafChallenge } from '@/routes/juejin/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:bo_table',
    categories: ['bbs'],
    example: '/etoland/star01',
    parameters: {
        bo_table: '板块 id，可在板块 URL 找到',
    },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['etoland.co.kr/b/:bo_table/list'],
            target: '/:bo_table',
        },
    ],
    name: '主题贴',
    maintainers: ['mengx8'],
    handler,
};

const baseUrl = 'https://etoland.co.kr';

const getWafToken = (url: string) =>
    cache.tryGet(
        'etoland:_waftokenid',
        async () => {
            const challengePage: string = await ofetch(url);
            const challenge = /atob\('([\d+/=A-Za-z]{80,})'\)/.exec(challengePage)![1];

            const response = await ofetch.raw(url, {
                headers: { cookie: `_wafchallengeid=${solveWafChallenge(challenge)};` },
                redirect: 'manual',
            });
            return response.headers
                .getSetCookie()
                .map((c) => c.split(';', 1)[0])
                .find((c) => c.startsWith('_waftokenid='))!;
        },
        600, // WAF token is valid for 600s
        false
    ) as Promise<string>;

const extractArticleList = ($: CheerioAPI) => {
    const chunk = /self\.__next_f\.push\(\[\d+,(".*")\]\)/s.exec($('script:contains("articleList")').text());
    if (!chunk) {
        throw new InvalidParameterError('This board is not supported');
    }

    const stream = JSON.parse(chunk[1]);
    const start = stream.indexOf('"articleList":') + '"articleList":'.length;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < stream.length; i++) {
        const char = stream[i];
        if (escaped) {
            escaped = false;
        } else if (char === '\\') {
            escaped = true;
        } else if (char === '"') {
            inString = !inString;
        } else if (!inString) {
            if (char === '[') {
                depth++;
            } else if (char === ']' && --depth === 0) {
                return JSON.parse(stream.slice(start, i + 1));
            }
        }
    }
    throw new Error('Failed to locate articleList in the page payload');
};

async function handler(ctx: Context): Promise<Data> {
    const { bo_table } = ctx.req.param();
    const link = `${baseUrl}/b/${bo_table}/list`;

    const cookie = await getWafToken(link);
    const response = await ofetch(link, { headers: { cookie } });

    const articles = extractArticleList(load(response));
    const items = articles.slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 25).map((article) => ({
        title: article.subject,
        link: `${baseUrl}/b/${article.boTable}/view/${encodeURIComponent(article.slug)}`,
        author: article.member.nickname,
        category: article.category,
        pubDate: parseDate(article.writeDateTimestamp),
        comments: article.commentCount,
    }));

    return {
        title: `eTOLAND - ${articles[0].boTableName}`,
        link,
        language: 'ko',
        item: items,
    };
}
