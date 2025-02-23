import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'path';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

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

                    const content = art(path.join(__dirname, 'templates/daily.art'), {
                        numStats,
                        tableData,
                        topList,
                    });

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
