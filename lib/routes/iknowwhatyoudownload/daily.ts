import { Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import got from '@/utils/got';

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
                const cacheKey = `${dateFormatted}-${country}`;
                return cache.tryGet(cacheKey, async () => {
                    const url = `${baseUrl}${dateFormatted}`;
                    const response = await got({
                        method: 'get',
                        url,
                    });

                    if (!response) {
                        return {};
                    }

                    const $ = load(response.data);
                    const $content = $('<article>');

                    const detailList = $('.tab-pane');

                    // num stats
                    const $numStats = $('<div class="stats">');
                    $numStats.append('<h1>Torrent download statistics</h1>');
                    const numStatsFormatted = $('<ul>');
                    $('.usePercent').each((_, elem) => {
                        const percent = $(elem).text();
                        const desc = $(elem).parent().find('span').last().text();
                        numStatsFormatted.append(`<li><span>${percent}</span> ${desc}</li>`);
                    });
                    $numStats.append(numStatsFormatted);
                    $content.append($numStats);

                    // table view
                    const $table = $('<div class="table-view">');
                    $table.append('<h1>Table View</h1>');
                    const dataMatch = response.data.match(/data:\s*\[([\d",\s]+)\]/);
                    const labelsMatch = response.data.match(/labels:\s*\[(.*?)\]/);

                    if (dataMatch?.[1] && labelsMatch?.[1]) {
                        const result = {};

                        const dataList = dataMatch[1].split(',').map((s) => s.trim().replaceAll('"', ''));
                        const labelsList = labelsMatch[1]
                            .split(',')
                            .map((s) => s.replaceAll('"', '').trim())
                            .filter((i) => i !== '');

                        for (const index in labelsList) {
                            const label = labelsList[index];
                            const count = dataList[index];
                            const [key, percent] = label.split(' ');
                            result[key] = {
                                count,
                                percent,
                            };
                        }

                        const table = $('<table>');
                        table.append('<tr><th>Category</th><th>Count</th><th>Percent</th></tr>');
                        for (const key in result) {
                            const row = $('<tr>');
                            row.append(`<td>${key}</td>`);
                            row.append(`<td>${result[key].count}</td>`);
                            row.append(`<td>${result[key].percent}</td>`);
                            table.append(row);
                        }
                        $table.append(table);
                    }

                    $content.append($table);

                    // top list
                    const $topList = $('<div class="top-list">');
                    $topList.append('<h1>Top List</h1>');
                    const details = detailList.toArray().map((item) => {
                        const h2Text = $(item).attr('id');
                        const exist = `<h2>${h2Text?.toUpperCase()}</h2>${$(item).find('ul').toString()}`;
                        return exist;
                    });
                    $topList.append(details.join(''));

                    $content.append($topList);

                    const content = $content.html();

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
