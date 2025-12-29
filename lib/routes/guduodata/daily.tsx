import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const host = 'http://d.guduodata.com';

const types = {
    collect: {
        name: '汇总榜',
        categories: {
            drama: '连续剧',
            variety: '综艺',
        },
    },
    bill: {
        name: '排行榜',
        categories: {
            network_drama: '网络剧',
            network_movie: '网络大电影',
            network_variety: '网络综艺',
            tv_drama: '电视剧',
            tv_variety: '电视综艺',
            anime: '国漫',
        },
    },
};

export const route: Route = {
    path: '/daily',
    categories: ['other'],
    example: '/guduodata/daily',
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
            source: ['guduodata.com/'],
        },
    ],
    name: '日榜',
    maintainers: ['Gem1ni'],
    handler,
    url: 'guduodata.com/',
};

async function handler() {
    const now = dayjs().valueOf();
    // yestoday
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const renderRows = (rows) => renderToString(<GuduodataDailyTable rows={rows} />);
    const items = Object.keys(types).flatMap((key) =>
        Object.keys(types[key].categories).map((category) => ({
            type: key,
            name: `[${yestoday}] ${types[key].name} - ${types[key].categories[category]}`,
            category: category.toUpperCase(),
            url: `${host}/m/v3/billboard/list?type=DAILY&category=${category.toUpperCase()}&date=${yestoday}`,
        }))
    );
    return {
        title: `骨朵数据 - 日榜`,
        link: host,
        description: yestoday,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.url, async () => {
                    const response = await got.get(`${item.url}&t=${now}`, {
                        headers: { Referer: `http://guduodata.com/` },
                    });
                    const data = response.data.data;
                    return {
                        title: item.name,
                        pubDate: yestoday,
                        link: item.url,
                        description: renderRows(data),
                    };
                })
            )
        ),
    };
}

const GuduodataDailyTable = ({ rows }: { rows: any[] }) => (
    <table border="1" cellpadding="2" cellspacing="0">
        <thead>
            <th>排名</th>
            <th>剧名</th>
            <th>播放平台</th>
            <th>上映时间</th>
            <th>评论数</th>
            <th>百度指数</th>
            <th>豆瓣评分</th>
            <th>全网热度</th>
        </thead>
        <tbody>
            {rows.map((row, index) => (
                <tr>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.platforms}</td>
                    <td>{row.release_date}</td>
                    <td>{row.comment || ''}</td>
                    <td>{row.baidu_index || ''}</td>
                    <td>{row.douban || ''}</td>
                    <td>{row.gdi}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
