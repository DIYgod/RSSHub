import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['programming'],
    example: '/opengithub-trending/weekly',
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
            target: '/opengithub-trending/weekly',
        },
    ],
    name: 'Weekly Rank',
    maintainers: ['Nemocccc'],
    description: '追踪 OpenGithubs 每周发布的开源项目排行榜',
    handler,
};

async function handler() {
    const repoUrl = 'https://api.github.com/repos/OpenGithubs/github-weekly-rank/contents';

    const yearResponse = await got(repoUrl);
    const years = yearResponse.data
        .filter((item: any) => item.type === 'dir' && /^\d{4}$/.test(item.name))
        .sort((a: any, b: any) => b.name.localeCompare(a.name))
        .slice(0, 2);

    const monthPromises = years.map((yearItem: any) =>
        got(repoUrl + '/' + yearItem.name).then((monthResponse) => ({
            year: yearItem.name,
            months: monthResponse.data
                .filter((item: any) => item.type === 'dir')
                .sort((a: any, b: any) => b.name.localeCompare(a.name))
                .slice(0, 3),
        }))
    );

    const monthData = await Promise.all(monthPromises);

    const dayPromises = monthData.flatMap(({ year, months }: any) =>
        months.map((monthItem: any) =>
            got(repoUrl + '/' + year + '/' + monthItem.name).then((dayResponse) => ({
                year,
                month: monthItem.name,
                days: dayResponse.data
                    .filter((item: any) => item.type === 'file' && item.name.endsWith('.md'))
                    .sort((a: any, b: any) => b.name.localeCompare(a.name))
                    .slice(0, 5),
            }))
        )
    );

    const allDayData = await Promise.all(dayPromises);

    const filePromises = allDayData.flatMap(({ year, month, days }: any) =>
        days.map((dayItem: any) => {
            const fileName = dayItem.name.replace('.md', '');
            const fileUrl = 'https://raw.githubusercontent.com/OpenGithubs/github-weekly-rank/main/' + year + '/' + month + '/' + dayItem.name;
            return got(fileUrl).then((fileContent) => ({
                title: 'GitHub Weekly Rank - ' + fileName,
                description: fileContent.data,
                link: 'https://github.com/OpenGithubs/github-weekly-rank/blob/main/' + year + '/' + month + '/' + fileName + '.md',
                pubDate: parseDate(year + '-' + month + '-' + fileName.slice(6)),
            }));
        })
    );

    const items = (await Promise.all(filePromises)).slice(0, 20);

    return {
        title: 'OpenGithubs Weekly Rank',
        link: 'https://github.com/OpenGithubs/github-weekly-rank',
        description: 'OpenGithubs 每周开源项目排行榜',
        item: items,
    };
}
