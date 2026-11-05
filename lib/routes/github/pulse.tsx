import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

interface PulseEntry {
    title: string;
    number: number | string;
    path: string;
    createdAt: string;
    mergedAt?: string;
    closedAt?: string;
    commentCount?: number;
}

interface PulseOverview {
    period: string;
    rangeLabel: string;
    totalPullRequests: number;
    totalIssues: number;
    mergedPulls: PulseEntry[];
    newPulls: PulseEntry[];
    closedIssues: PulseEntry[];
    newIssues: PulseEntry[];
    discussions: PulseEntry[];
    releases: PulseEntry[];
}

interface PulseDiffstat {
    authorsWithCommits: number;
    filesChanged: number;
    additions: number;
    deletions: number;
    masterCommits: number;
    totalCommits: number;
    defaultBranch: string;
    comparePathUrl: string;
}

interface PulseCommitter {
    name?: string;
    login: string;
    commits: number;
}

async function handler(ctx) {
    const { user, repo, period } = ctx.req.param();
    const periods = ['daily', 'halfweekly', 'weekly', 'monthly'];
    const pulsePeriod = periods.includes(period) ? period : periods[2];
    const baseUrl = 'https://github.com';
    const link = `${baseUrl}/${user}/${repo}/pulse/${pulsePeriod}`;
    const { data: pulsePage } = await got(link);
    const $ = load(pulsePage);
    const embeddedData = $('react-app[app-name="repos-pulse"] script[data-target="react-app.embeddedData"]').text();
    if (!embeddedData) {
        throw new Error('GitHub Pulse page does not provide the expected public data endpoints.');
    }
    const paths = JSON.parse(embeddedData).payload?.pulseRoute;
    if (!paths?.overviewDataPath || !paths.diffstatSummaryPath || !paths.committerDataPath) {
        throw new Error('GitHub Pulse page is missing its public data endpoints.');
    }
    const options = { headers: { Accept: 'application/json' } };
    const [overview, diffstat, committers] = await Promise.all([
        ofetch<PulseOverview>(new URL(`${paths.overviewDataPath}/${pulsePeriod}`, baseUrl).href, options),
        ofetch<PulseDiffstat>(new URL(`${paths.diffstatSummaryPath}/${pulsePeriod}`, baseUrl).href, options),
        ofetch<PulseCommitter[]>(new URL(`${paths.committerDataPath}/${pulsePeriod}`, baseUrl).href, options),
    ]);
    const [periodFrom, periodTo] = overview.rangeLabel?.split(' – ', 2) ?? [];
    const pubDate = periodTo ? parseDate(`${periodTo} UTC`) : undefined;
    const sections = [
        { heading: 'Releases', entries: overview.releases, dateField: 'createdAt' },
        { heading: 'Merged pull requests', entries: overview.mergedPulls, dateField: 'mergedAt' },
        { heading: 'Opened pull requests', entries: overview.newPulls, dateField: 'createdAt' },
        { heading: 'Closed issues', entries: overview.closedIssues, dateField: 'closedAt' },
        { heading: 'Opened issues', entries: overview.newIssues, dateField: 'createdAt' },
        { heading: 'Discussions', entries: overview.discussions, dateField: 'createdAt' },
    ] as const;
    if (
        overview.period !== pulsePeriod ||
        !periodFrom ||
        !pubDate ||
        !Number.isFinite(pubDate.getTime()) ||
        !Number.isFinite(overview.totalPullRequests) ||
        !Number.isFinite(overview.totalIssues) ||
        !Number.isFinite(diffstat.totalCommits) ||
        !Array.isArray(committers) ||
        sections.some(({ entries }) => !Array.isArray(entries))
    ) {
        throw new Error('GitHub Pulse returned incomplete statistics or an invalid date range.');
    }

    return {
        title: `${user}/${repo} ${pulsePeriod} Pulse`,
        link,
        item: [
            {
                guid: md5(`${user}${repo}${pulsePeriod}${periodFrom}${periodTo}`),
                title: `${periodFrom} - ${periodTo}`,
                link,
                description: renderToString(
                    <>
                        <h2>Overview</h2>
                        <ul>
                            <li>{overview.totalPullRequests} pull requests</li>
                            <li>{overview.totalIssues} issues</li>
                        </ul>
                        <h2>Commit activity</h2>
                        <p>
                            {diffstat.authorsWithCommits} authors made {diffstat.masterCommits} commits to {diffstat.defaultBranch} and {diffstat.totalCommits} commits across all branches.
                            {diffstat.filesChanged} files changed with {diffstat.additions} additions and {diffstat.deletions} deletions.
                        </p>
                        <a href={new URL(diffstat.comparePathUrl, baseUrl).href}>Compare changes</a>
                        <ul>
                            {committers.map((committer) => (
                                <li>
                                    <a href={`${baseUrl}/${committer.login}`}>{committer.name || committer.login}</a>: {committer.commits} commits
                                </li>
                            ))}
                        </ul>
                        {sections.map((section) => (
                            <>
                                <h2>{section.heading}</h2>
                                <ul>
                                    {section.entries.map((entry) => (
                                        <li>
                                            <a href={new URL(entry.path, baseUrl).href}>{entry.title}</a> #{entry.number}
                                            <p>{entry[section.dateField]}</p>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ))}
                    </>
                ),
                pubDate,
            },
        ],
    };
}
