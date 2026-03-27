import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/central/:group/:artifact',
    name: 'Maven Central Feed',
    maintainers: ['chrisis58'],
    description: 'Get the latest versions of a Maven artifact from Maven Central Repository.',
    url: 'central.sonatype.com/',
    categories: ['programming'],
    parameters: {
        group: {
            description: 'The group ID of the Maven artifact (e.g., org.springframework)',
        },
        artifact: {
            description: 'The artifact ID of the Maven artifact (e.g., spring-core)',
        },
    },
    example: '/maven/central/org.springframework/spring-core',
    radar: [
        {
            source: ['central.sonatype.com/artifact/:group/:artifact/:suffix', 'central.sonatype.com/artifact/:group/:artifact'],
            target: '/maven/central/:group/:artifact',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: false,
    },
    handler,
};

/**
 * Regex to identify unstable versions
 * Handles cases with delimiters: 1.0.0-rc1, 2.0.0.M2, 6.0.0_preview
 * Handles cases without delimiters: 5.0.0beta2, 7.0.0canary
 * Handles secondary versions: 1.0.0-M6.1
 */
const UNSTABLE_VERSION_REGEX = /[-_.]?(rc|m|snapshot|alpha|beta|preview|canary)[.\d]*$/i;

/**
 * Regex to extract date in the format YYYY-MM-DD HH:mm (e.g., 2024-09-22 04:19)
 */
const DATE_REGEX = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;

async function handler(ctx) {
    const group = ctx.req.param('group');
    const artifact = ctx.req.param('artifact');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    // (org.springframework, spring-core) -> org/springframework/spring-core
    const identifier = `${group.replaceAll('.', '/')}/${artifact}`;

    try {
        const metadataUrl = `https://repo1.maven.org/maven2/${identifier}/maven-metadata.xml`;
        const metaDataResponse = await ofetch(metadataUrl);

        const $meta = load(metaDataResponse, { xmlMode: true });
        const latestVersion = $meta('metadata > versioning > latest').text();

        if (!latestVersion) {
            throw new Error(`Not a valid component for ${group}:${artifact}: versions not found`);
        }
    } catch (error: any) {
        if (error?.response?.status === 404) {
            throw new Error(`Could not find component for ${group}:${artifact}: metadata not found`, { cause: error });
        }
        throw error;
    }

    const response = await ofetch(`https://repo1.maven.org/maven2/${identifier}/`);
    const $ = load(response);

    const items = $('pre#contents a')
        .toArray()
        .filter((element) => {
            const href = $(element).attr('href') ?? '';
            return href.endsWith('/') && href !== '../';
        })
        .map((element) => {
            const href = $(element).attr('href') ?? '';
            const version = href.replace('/', '');
            const versionUrl = `https://central.sonatype.com/artifact/${group}/${artifact}/${version}`;

            const rawText = element.nextSibling ? (element.nextSibling as any).nodeValue : '';

            // Date format: 2024-09-22 04:19
            const match = rawText.match(DATE_REGEX);
            let pubDate: Date | undefined;
            if (match) {
                pubDate = parseDate(match[1], 'YYYY-MM-DD HH:mm');
            }

            const category = UNSTABLE_VERSION_REGEX.test(version) ? 'Unstable' : 'Stable';

            return {
                title: `Version ${version} of ${group}:${artifact}`,
                link: versionUrl,
                pubDate,
                description: `Released version ${version} of ${group}:${artifact}.`,
                category: [category],
            };
        })
        .filter((item) => !!item && item.pubDate !== undefined)
        .toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0))
        .slice(0, limit);

    return {
        title: `Maven Central - ${group}:${artifact}`,
        link: `https://central.sonatype.com/artifact/${group}/${artifact}`,
        description: `Versions of ${group}:${artifact} available on Maven Central.`,
        item: items,
    };
}
