import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const teamDomains: Record<string, string> = {
    '49ers': 'www.49ers.com',
    bears: 'www.chicagobears.com',
    bengals: 'www.bengals.com',
    bills: 'www.buffalobills.com',
    broncos: 'www.denverbroncos.com',
    browns: 'www.clevelandbrowns.com',
    buccaneers: 'www.buccaneers.com',
    cardinals: 'www.azcardinals.com',
    chargers: 'www.chargers.com',
    chiefs: 'www.chiefs.com',
    colts: 'www.colts.com',
    commanders: 'www.commanders.com',
    cowboys: 'www.dallascowboys.com',
    dolphins: 'www.miamidolphins.com',
    eagles: 'www.philadelphiaeagles.com',
    falcons: 'www.atlantafalcons.com',
    giants: 'www.giants.com',
    jaguars: 'www.jaguars.com',
    jets: 'www.newyorkjets.com',
    lions: 'www.detroitlions.com',
    packers: 'www.packers.com',
    panthers: 'www.panthers.com',
    patriots: 'www.patriots.com',
    raiders: 'www.raiders.com',
    rams: 'www.therams.com',
    ravens: 'www.baltimoreravens.com',
    saints: 'www.neworleanssaints.com',
    seahawks: 'www.seahawks.com',
    steelers: 'www.steelers.com',
    texans: 'www.houstontexans.com',
    titans: 'www.tennesseetitans.com',
    vikings: 'www.vikings.com',
};

export const route: Route = {
    path: '/news/:team',
    categories: ['traditional-media'],
    example: '/nfl/news/seahawks',
    parameters: { team: 'Team name as used in the route key, see table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(teamDomains).map(([team, domain]) => ({
        source: [`${domain}/news/*`],
        target: `/news/${team}`,
    })),
    name: 'Team News',
    maintainers: ['nickyfoto'],
    description: `Fetches news from official NFL team websites.

| Team | Key | Domain |
|------|-----|--------|
| Arizona Cardinals | cardinals | azcardinals.com |
| Atlanta Falcons | falcons | atlantafalcons.com |
| Baltimore Ravens | ravens | baltimoreravens.com |
| Buffalo Bills | bills | buffalobills.com |
| Carolina Panthers | panthers | panthers.com |
| Chicago Bears | bears | chicagobears.com |
| Cincinnati Bengals | bengals | bengals.com |
| Cleveland Browns | browns | clevelandbrowns.com |
| Dallas Cowboys | cowboys | dallascowboys.com |
| Denver Broncos | broncos | denverbroncos.com |
| Detroit Lions | lions | detroitlions.com |
| Green Bay Packers | packers | packers.com |
| Houston Texans | texans | houstontexans.com |
| Indianapolis Colts | colts | colts.com |
| Jacksonville Jaguars | jaguars | jaguars.com |
| Kansas City Chiefs | chiefs | chiefs.com |
| Las Vegas Raiders | raiders | raiders.com |
| Los Angeles Chargers | chargers | chargers.com |
| Los Angeles Rams | rams | therams.com |
| Miami Dolphins | dolphins | miamidolphins.com |
| Minnesota Vikings | vikings | vikings.com |
| New England Patriots | patriots | patriots.com |
| New Orleans Saints | saints | neworleanssaints.com |
| New York Giants | giants | giants.com |
| New York Jets | jets | newyorkjets.com |
| Philadelphia Eagles | eagles | philadelphiaeagles.com |
| Pittsburgh Steelers | steelers | steelers.com |
| San Francisco 49ers | 49ers | 49ers.com |
| Seattle Seahawks | seahawks | seahawks.com |
| Tampa Bay Buccaneers | buccaneers | buccaneers.com |
| Tennessee Titans | titans | tennesseetitans.com |
| Washington Commanders | commanders | commanders.com |`,
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');
    const domain = teamDomains[team];
    if (!domain) {
        throw new Error(`Unknown NFL team: ${team}. Valid teams: ${Object.keys(teamDomains).join(', ')}`);
    }

    const baseUrl = `https://${domain}`;
    const listingUrl = `${baseUrl}/news/`;

    const response = await ofetch(listingUrl);
    const $ = load(response);

    const seen = new Set<string>();
    const list: Array<{ title: string; link: string }> = [];

    $('a[href^="/news/"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        // Only match article links: /news/{single-slug} (no extra path segments or trailing slash)
        if (!href || !/^\/news\/[^/]+$/.test(href) || seen.has(href)) {
            return;
        }
        seen.add(href);
        const title = $el.text().trim() || $el.find('img').attr('alt') || '';
        if (title) {
            list.push({
                title,
                link: `${baseUrl}${href}`,
            });
        }
    });

    const items = (
        await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    let articleResponse;
                    try {
                        articleResponse = await ofetch(item.link);
                    } catch {
                        return null;
                    }
                    const $article = load(articleResponse);

                    let jsonLd: Record<string, any> | null = null;
                    $article('script[type="application/ld+json"]').each((_, el) => {
                        try {
                            const data = JSON.parse($article(el).text());
                            const candidate = Array.isArray(data) ? data.find((d) => d['@type'] === 'NewsArticle') : data;
                            if (candidate?.['@type'] === 'NewsArticle') {
                                jsonLd = candidate;
                            }
                        } catch {
                            // skip malformed JSON-LD
                        }
                    });

                    const result: DataItem = {
                        title: jsonLd?.headline || item.title,
                        link: item.link,
                        pubDate: jsonLd?.datePublished ? parseDate(jsonLd.datePublished) : undefined,
                        author: jsonLd?.author?.name || (Array.isArray(jsonLd?.author) ? jsonLd.author[0]?.name : undefined),
                        image: jsonLd?.image?.url || (Array.isArray(jsonLd?.image) ? jsonLd.image[0]?.url : undefined),
                    };

                    // Try to extract article body HTML
                    const contentSelectors = ['article .nfl-c-body-part', '.article-body', 'article [data-module="content"]', 'article'];
                    for (const selector of contentSelectors) {
                        const content = $article(selector);
                        if (content.length) {
                            content.find('script, style, [data-ad], .ad, .social-share, .related-content').remove();
                            // Fix lazy-loaded images: real URLs live in data-src/data-srcset, src is a placeholder GIF
                            content.find('img[data-src]').each((_, img) => {
                                const $img = $article(img);
                                $img.attr('src', $img.attr('data-src')!);
                                $img.removeAttr('data-src');
                            });
                            content.find('source[data-srcset]').each((_, src) => {
                                const $src = $article(src);
                                $src.attr('srcset', $src.attr('data-srcset')!);
                                $src.removeAttr('data-srcset');
                            });
                            const html = content
                                .toArray()
                                .map((el) => $article(el).html())
                                .filter(Boolean)
                                .join('');
                            if (html) {
                                result.description = html;
                                break;
                            }
                        }
                    }

                    if (!result.description && jsonLd?.description) {
                        result.description = jsonLd.description;
                    }

                    return result;
                })
            )
        )
    ).filter(Boolean) as DataItem[];

    return {
        title: $('title').text() || `${team.charAt(0).toUpperCase() + team.slice(1)} News`,
        link: listingUrl,
        language: 'en',
        item: items,
    };
}
