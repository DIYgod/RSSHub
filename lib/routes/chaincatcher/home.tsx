import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.chaincatcher.com';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['chaincatcher.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'chaincatcher.com/',
};

async function handler() {
    const { data } = await got.post(`${rootUrl}/api/article/lists`, {
        form: {
            page: 1,
            home: 1,
        },
    });

    const list = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${rootUrl}/article/${item.id}`,
        pubDate: parseDate(item.add_time, 'X'),
        categoryId: item.categoryid,
        category: [...item.keywords.split(','), item.category_name],
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.categoryId !== 3) {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    item.description = renderToString(
                        <>
                            {item.description ? (
                                <>
                                    <blockquote>{item.description}</blockquote>
                                    <br />
                                </>
                            ) : null}
                            {$('.article-container').html() ? raw($('.article-container').html() as string) : null}
                        </>
                    );
                }

                return item;
            })
        )
    );

    return {
        title: '链捕手ChainCatcher — 专业的区块链技术研究与资讯平台-Chain Catcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: rootUrl,
        item: items,
    };
}
