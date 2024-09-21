import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import path from 'node:path';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/pulse/:user/:repo/:period?',
    categories: ['programming'],
    example: '/github/pulse/DIYgod/RSSHub',
    parameters: {
        user: 'User name',
        repo: 'Repo name',
        period: "Time frame, selected from a repository's Pulse/Insights page. Possible values are: `daily`, `halfweekly`, `weekly`, or `monthly`. Default: `weekly`. If your RSS client supports it, consider aligning the polling frequency of the feed to the period.",
    },
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
            source: ['github.com/:user/:repo/pulse', 'github.com/:user/:repo/pulse/:period'],
        },
    ],
    name: 'Repo Pulse',
    maintainers: ['jameschensmith'],
    handler,
};

async function handler(ctx) {
    const { user, repo, period } = ctx.req.param();

    const periods = ['daily', 'halfweekly', 'weekly', 'monthly'];
    const pulsePeriod = periods.includes(period) ? period : periods[2];

    const link = `https://github.com/${user}/${repo}/pulse/${pulsePeriod}`;
    const { data: pulsePage } = await got(link);
    const $ = load(pulsePage);

    const $mainSections = $('main .Layout-main').children();

    const $subheading = $mainSections.eq(0);
    const [periodFrom, periodTo] = $subheading.find('h2').text().split('–');

    const $overview = $mainSections.eq(1);
    const overviewItems = $overview
        .find('ul ul li')
        .map((_, el) => $(el).text())
        .toArray();

    const $commitActivity = $mainSections.eq(2);
    let commitActivity;
    const $contributionData = $commitActivity.find('.js-pulse-contribution-data');
    if ($contributionData.length) {
        const summaryUrl = $contributionData.attr('data-pulse-diffstat-summary-url');
        commitActivity = (await got(`https://github.com${summaryUrl}`)).data;
    } else {
        commitActivity = $commitActivity.text();
    }

    const $githubActivity = $mainSections.eq(3);
    let githubActivity;
    const $sections = $githubActivity.find('h3');
    if ($sections.length) {
        githubActivity = $sections
            .map((_, section) => {
                const $section = $(section);
                const $sectionSiblings = $section.nextUntil('h3');
                const $paragraph = $section.nextUntil('ul');
                const $list = $sectionSiblings.last();
                return {
                    heading: $section.text(),
                    paragraph: $paragraph.length > 0 ? $paragraph.text() : undefined,
                    items: $list
                        .children()
                        .map((_, item) => {
                            const $item = $(item);
                            const $link = $item.find('a');
                            const $details = $item.find('p');
                            const $relativeTime = $details.find('relative-time');
                            $relativeTime.replaceWith($relativeTime.attr('datetime'));
                            return {
                                link: { text: $link.text(), url: $link.attr('href') },
                                details: $details.text(),
                            };
                        })
                        .toArray(),
                };
            })
            .toArray();
    }

    return {
        title: `${user}/${repo} ${pulsePeriod} Pulse`,
        link,
        item: [
            {
                guid: md5(`${user}${repo}${period}${periodFrom}${periodTo}`),
                title: `${periodFrom} - ${periodTo}`,
                description: art(path.join(__dirname, 'templates/pulse-description.art'), {
                    overviewItems,
                    commitActivity,
                    githubActivity,
                }),
                pubDate: parseDate(periodTo),
            },
        ],
    };
}
