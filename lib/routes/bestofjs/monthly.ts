import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';

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
            const description = oneMonthlyRankings.join('<br />');
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
    const months: string[] = [];
    for (let i = 1; i <= 6; i++) {
        let year = currentYear;
        let month = currentMonth - i;
        if (month <= 0) {
            month += 12;
            year -= 1;
        }
        months.push(`${year}-${month}`);
    }
    return months;
};

const getMonthlyRankings = (year: string, month: string): Promise<string[]> => {
    const targetUrl = `${BASEURL}/${year}/${month}`;
    return cache.tryGet(
        targetUrl,
        async () => {
            const response = await ofetch(targetUrl);
            const $ = load(response);
            return $('table.w-full tbody tr[data-testid="project-card"]')
                .toArray()
                .map((el, i) => {
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
                    return `
                        <p>Rank ${i + 1}</p>
                        ${logo ? `<img src="https://bestofjs.org${logo}" alt="${projectName}" height="32" width="32" />` : ''}
                        <p>${description}</p>
                        <p><strong>Stars:</strong> ${starCount}</p>
                        <p><strong>Additional Info:</strong> ${additionalInfo}</p>
                        ${githubLink ? `<p><strong>GitHub:</strong> <a href="${githubLink}">${githubLink}</a></p>` : ''}
                        ${homepageLink ? `<p><strong>Homepage:</strong> <a href="${homepageLink}">${homepageLink}</a></p>` : ''}
                        ${tags.length ? `<p><strong>Tags:</strong> ${tags.map((tag) => `<a href="/projects?tags=${tag.toLowerCase()}">${tag}</a>`).join(' ')}</p>` : ''}
                    `.trim();
                });
        },
        30 * 24 * 60 * 60
    );
};
