import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const BASEURL = 'https://bestofjs.org/rankings/monthly';

export const route: Route = {
    path: '/rankings/monthly',
    categories: ['programming'],
    example: '/bestofjs/rankings/monthly',
    view: ViewType.Notifications,
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
            source: ['bestofjs.org/rankings/monthly/:year/:month'],
            target: '/rankings/monthly',
        },
    ],
    name: 'Monthly Rankings',
    maintainers: ['ztkuaikuai'],
    url: 'bestofjs.org/rankings/monthly',
    handler: async () => {
        const targetMonths = getLastSixMonths();
        const allNeededMonthlyRankings = await Promise.all(
            targetMonths.map((data) => {
                const [year, month] = data.split('-');
                return getMonthlyRankings(year, month);
            })
        );
        const items = allNeededMonthlyRankings.flatMap((oneMonthlyRankings, i) => {
            const [year, month] = targetMonths[i].split('-');
            const description = renderToString(
                <ul>
                    {oneMonthlyRankings.map((item, index) => (
                        <>
                            <li>
                                <p>
                                    <strong>{`Rank ${index + 1}`}</strong>
                                </p>
                                {item.logo ? <img src={`https://bestofjs.org${item.logo}`} alt={item.projectName} height="32" width="32" /> : null}
                                {item.projectName ? (
                                    <p>
                                        <strong>Project:</strong> {item.projectName}
                                    </p>
                                ) : null}
                                {item.description ? <p>{item.description}</p> : null}
                                {item.starCount ? (
                                    <p>
                                        <strong>Stars:</strong> {item.starCount}
                                    </p>
                                ) : null}
                                {item.additionalInfo ? (
                                    <p>
                                        <strong>Additional Info:</strong> {item.additionalInfo}
                                    </p>
                                ) : null}
                                {item.githubLink ? (
                                    <p>
                                        <strong>GitHub:</strong> <a href={item.githubLink}>{item.githubLink}</a>
                                    </p>
                                ) : null}
                                {item.homepageLink ? (
                                    <p>
                                        <strong>Homepage:</strong> <a href={item.homepageLink}>{item.homepageLink}</a>
                                    </p>
                                ) : null}
                                {item.tags?.length ? (
                                    <p>
                                        <strong>Tags:</strong>{' '}
                                        {item.tags.map((tag, tagIndex) => (
                                            <>
                                                <a href={`/projects?tags=${tag.toLowerCase()}`}>{tag}</a>
                                                {tagIndex < item.tags.length - 1 ? ', ' : ''}
                                            </>
                                        ))}
                                    </p>
                                ) : null}
                            </li>
                            <br />
                        </>
                    ))}
                </ul>
            );
            return {
                title: `Best of JS Monthly Rankings - ${year}/${month}`,
                description,
                link: `${BASEURL}/${year}/${month}`,
                guid: `${BASEURL}/${year}/${month}`,
                author: 'Best of JS',
            };
        });

        return {
            title: 'Best of JS Monthly Rankings',
            link: BASEURL,
            description: 'Monthly rankings of the most popular JavaScript projects on Best of JS',
            item: items,
            language: 'en',
        };
    },
};

const getLastSixMonths = (): string[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-based to 1-based
    return Array.from({ length: 6 }, (_, i) => {
        let month = currentMonth - (i + 1);
        let year = currentYear;
        if (month <= 0) {
            month += 12;
            year -= 1;
        }
        return `${year}-${month}`;
    });
};

interface RankingItem {
    logo: string;
    projectName: string;
    githubLink: string;
    homepageLink: string;
    description: string;
    tags: string[];
    starCount: string;
    additionalInfo: string;
}

const getMonthlyRankings = (year: string, month: string): Promise<RankingItem[]> => {
    const targetUrl = `${BASEURL}/${year}/${month}`;
    return cache.tryGet(targetUrl, async () => {
        const response = await ofetch(targetUrl);
        const $ = load(response);
        return $('table.w-full tbody tr[data-testid="project-card"]')
            .toArray()
            .map((el) => {
                const $tr = $(el);
                // Project logo
                const logo =
                    $tr
                        .find('td:first img')
                        .attr('src')
                        ?.replace(/.dark./, '.') || '';
                // Project name and link
                const projectLink = $tr.find('td:nth-child(2) a[href^="/projects/"]').first();
                const projectName = projectLink.text().trim();
                // GitHub and homepage links
                const githubLink = $tr.find('td:nth-child(2) a[href*="github.com"]').attr('href') || '';
                const homepageLink = $tr.find('td:nth-child(2) a[href*="http"]:not([href*="github.com"])').attr('href') || '';
                // Description
                const description = $tr.find('td:nth-child(2) .font-serif').text().trim();
                // Tags
                const tags = $tr
                    .find('td:nth-child(2) [href*="/projects?tags="]')
                    .toArray()
                    .map((tag) => $(tag).text().trim());
                // Star count
                const starCount = $tr.find('td:nth-child(4) span:last').text().trim() || $tr.find('td:nth-child(2) .inline-flex span:last-child').text().trim();
                // Additional info (contributors, created date)
                const additionalInfo = $tr
                    .find('td:nth-child(3) > div')
                    .toArray()
                    .slice(1)
                    .map((el) => $(el).text().trim())
                    .join('; ');
                return {
                    logo,
                    projectName,
                    githubLink,
                    homepageLink,
                    description,
                    tags,
                    starCount,
                    additionalInfo,
                };
            });
    });
};
