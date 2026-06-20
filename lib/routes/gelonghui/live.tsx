import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.gelonghui.com';

export const route: Route = {
    path: '/live',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/gelonghui/live',
    parameters: {},
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
            source: ['gelonghui.com/live', 'gelonghui.com/'],
        },
    ],
    name: '实时快讯',
    maintainers: [],
    handler,
    url: 'gelonghui.com/live',
};

async function handler() {
    const apiUrl = `${baseUrl}/api/live-channels/all/lives/v4`;
    const {
        data: { result },
    } = await got(apiUrl);

    const items = result.map((i) => ({
        title: i.title || i.content,
        description: renderToString(<GelonghuiLiveDescription i={i} />),
        link: i.route,
        category: i.source,
        pubDate: parseDate(i.createTimestamp, 'X'),
    }));

    return {
        title: '格隆汇快讯-7x24小时市场快讯-财经市场热点',
        description: '格隆汇快讯栏目提供外汇投资实时行情,外汇投资交易,外汇投资炒股,证券等内容,实时更新,格隆汇未来将陆续开通台湾、日本、印度、欧洲等市场.',
        image: 'https://cdn.gelonghui.com/static/web/www.ico.la.ico',
        link: `${baseUrl}/live`,
        item: items,
    };
}

const GelonghuiLiveDescription = ({ i }: { i: { content?: string; pictures?: string[] } }) => (
    <>
        {i.content}
        {i.pictures?.length ? (
            <>
                <br />
                {i.pictures.map((p) => (
                    <img src={p} />
                ))}
            </>
        ) : null}
    </>
);
