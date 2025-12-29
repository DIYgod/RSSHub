import { load } from 'cheerio';
import dayjs from 'dayjs';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

interface TableData {
    key: string;
    count: string;
    percent: string;
}

export const route: Route = {
    path: '/stats/daily/:country',
    categories: ['other'],
    example: '/iknowwhatyoudownload/stats/daily/CN',
    url: 'iknowwhatyoudownload.com',
    name: 'Daily Torrents Statistics',
    maintainers: ['p3psi-boo'],
    parameters: { country: 'the country of the stats. ISO 3166-1 alpha-2 code.' },
    handler,
};

async function handler(ctx) {
    const { country } = ctx.req.param();
    const baseUrl = `https://iknowwhatyoudownload.com/en/stat/${country}/daily/q?statDate=`;

    const dates = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, 'day'));

    const items = (
        await Promise.all(
            dates.map((dateObj) => {
                const dateFormatted = dateObj.format('YYYY-MM-DD');
                const url = `${baseUrl}${dateFormatted}`;
                return cache.tryGet(url, async () => {
                    const response = await got({
                        method: 'get',
                        url,
                    });

                    if (!response) {
                        return {};
                    }

                    const $ = load(response.data);

                    const numStats: { percent: string; desc: string }[] = [];
                    $('.usePercent').each((_, elem) => {
                        numStats.push({
                            percent: $(elem).text(),
                            desc: $(elem).parent().find('span').last().text(),
                        });
                    });

                    const tableData: TableData[] = [];
                    const dataMatch = response.data.match(/data:\s*\[([\d",\s]+)\]/);
                    const labelsMatch = response.data.match(/labels:\s*\[(.*?)\]/);

                    if (dataMatch?.[1] && labelsMatch?.[1]) {
                        const dataList = dataMatch[1].split(',').map((s) => s.trim().replaceAll('"', ''));
                        const labelsList = labelsMatch[1]
                            .split(',')
                            .map((s) => s.replaceAll('"', '').trim())
                            .filter((i) => i !== '');

                        for (const index in labelsList) {
                            const label = labelsList[index];
                            const count = dataList[index];
                            const [key, percent] = label.split(' ');
                            tableData.push({
                                key,
                                count,
                                percent,
                            });
                        }
                    }

                    const topList = $('.tab-pane')
                        .toArray()
                        .map((item) => ({
                            title: $(item).attr('id')?.toUpperCase(),
                            content: $(item).find('ul').toString(),
                        }));

                    const content = renderToString(
                        <article>
                            <div class="stats">
                                <h1>Torrent download statistics</h1>
                                <ul>
                                    {numStats.map((stat) => (
                                        <li>
                                            <span>{stat.percent}</span> {stat.desc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div class="table-view">
                                <h1>Table View</h1>
                                {tableData ? (
                                    <table>
                                        <tr>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Percent</th>
                                        </tr>
                                        {tableData.map((row) => (
                                            <tr>
                                                <td>{row.key}</td>
                                                <td>{row.count}</td>
                                                <td>{row.percent}</td>
                                            </tr>
                                        ))}
                                    </table>
                                ) : null}
                            </div>
                            <div class="top-list">
                                <h1>Top List</h1>
                                {topList.map((entry) => (
                                    <>
                                        <h2>{entry.title}</h2>
                                        {raw(entry.content)}
                                    </>
                                ))}
                            </div>
                        </article>
                    );

                    return {
                        title: `Daily Torrents Statistics in ${country} for ${dateFormatted}`,
                        link: url,
                        description: content,
                        pubDate: dateObj.toDate(),
                    };
                });
            })
        )
    ).filter((item) => Object.keys(item).length > 0);

    return {
        title: `Daily Torrents Statistics in ${country} - iknownwhatyoudownload`,
        link: 'https://iknowwhatyoudownload.com',
        item: items,
    };
}
