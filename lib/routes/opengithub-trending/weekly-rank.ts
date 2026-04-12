import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly-rank',
    categories: ['programming'],
    example: '/opengithub-trending/weekly-rank',
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
            source: ['github.com/OpenGithubs/github-weekly-rank'],
            target: '/opengithub-trending/weekly-rank',
        },
    ],
    name: 'Weekly Rank',
    maintainers: ['Nemocccc'],
    description: '追踪 OpenGithubs 每周发布的开源项目排行榜',
    handler,
};

async function handler() {
    const repoUrl = 'https://api.github.com/repos/OpenGithubs/github-weekly-rank/contents';
    const headers: Record<string, string> = {};

    if (config.github?.accessToken) {
        headers.Authorization = `token ${config.github.accessToken}`;
    }

    const yearResponse = await got(repoUrl, { headers });
    const years = yearResponse.data
        .filter((item: any) => item.type === 'dir' && /^\d{4}$/.test(item.name))
        .toSorted((a: any, b: any) => b.name.localeCompare(a.name))
        .slice(0, 2);

    const getMonthData = async (yearItem: any) => {
        const monthResponse = await got(`${repoUrl}/${yearItem.name}`, { headers });
        return {
            year: yearItem.name,
            months: monthResponse.data
                .filter((item: any) => item.type === 'dir')
                .toSorted((a: any, b: any) => b.name.localeCompare(a.name))
                .slice(0, 3),
        };
    };

    const monthData = await Promise.all(years.map(getMonthData));

    const getDayData = async (year: string, monthItem: any) => {
        const dayResponse = await got(`${repoUrl}/${year}/${monthItem.name}`, { headers });
        return {
            year,
            month: monthItem.name,
            days: dayResponse.data
                .filter((item: any) => item.type === 'file' && item.name.endsWith('.md'))
                .toSorted((a: any, b: any) => b.name.localeCompare(a.name))
                .slice(0, 5),
        };
    };

    const dayPromises = monthData.flatMap(({ year, months }: any) => months.map((monthItem: any) => getDayData(year, monthItem)));

    const allDayData = await Promise.all(dayPromises);

    const md = new MarkdownIt();

    const getFileItem = async (year: string, month: string, dayItem: any) => {
        const fileName = dayItem.name.replace('.md', '');
        const fileUrl = `https://raw.githubusercontent.com/OpenGithubs/github-weekly-rank/main/${year}/${month}/${dayItem.name}`;
        const fileContent = await got(fileUrl);

        return {
            title: `GitHub Weekly Rank - ${fileName}`,
            description: md.render(fileContent.data),
            link: `https://github.com/OpenGithubs/github-weekly-rank/blob/main/${year}/${month}/${fileName}.md`,
            pubDate: parseDate(`${year}-${month}-${fileName.slice(6)}`),
        };
    };

    const filePromises = allDayData.flatMap(({ year, month, days }: any) => days.map((dayItem: any) => getFileItem(year, month, dayItem))).slice(0, 20);

    const items = await Promise.all(filePromises);

    return {
        title: 'OpenGithubs Weekly Rank',
        link: 'https://github.com/OpenGithubs/github-weekly-rank',
        description: 'OpenGithubs 每周开源项目排行榜',
        item: items,
    };
}
