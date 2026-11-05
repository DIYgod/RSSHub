import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://outage.report/';

export const route: Route = {
    path: '/:name/:count?',
    categories: ['forecast'],
    example: '/outagereport/ubisoft/5',
    parameters: { name: 'Service name, spelling format must be consistent with URL', count: 'Counting threshold, will only be written in RSS if the number of people who report to stop serving is not less than this number' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Report',
    maintainers: ['cxumol', 'nczitzk'],
    handler,
    description: 'Please skip the local service area code for `name`, for example `https://outage.report/us/verizon-wireless` to `verizon-wireless`.',
};

interface StatusCard {
    card: {
        summary: string;
        signalBuckets: Array<{ ts: number; count: number }>;
    };
}

async function handler(ctx) {
    const serviceName = ctx.req.param('name');
    const threshold = Number(ctx.req.param('count') ?? 10);
    const watchCount = Number.isFinite(threshold) && threshold > 0 ? threshold : 10;
    const url = `${baseUrl}${serviceName}`;
    const { card } = await ofetch<StatusCard>(`${baseUrl}api/card/${serviceName}`);
    const now = Date.now();
    const recentBuckets = card.signalBuckets.filter((bucket) => bucket.ts >= now - 20 * 60 * 1000 && bucket.ts < now);
    const reportCount = recentBuckets.reduce((total, bucket) => total + bucket.count, 0);
    const latestReport = Math.max(...recentBuckets.map((bucket) => bucket.ts));
    return {
        title: `Is ${serviceName} Down Right Now?`,
        link: url,
        description: card.summary.replaceAll(/\{\{([^|}]+)\|[^}]+\}\}/g, '$1'),
        item:
            reportCount >= watchCount
                ? [
                      {
                          title: `${serviceName} appear to be (partially) down`,
                          description: `${reportCount} reports in the last 20 minutes`,
                          pubDate: parseDate(latestReport, 'x'),
                          guid: `${serviceName}:${latestReport}`,
                          link: url,
                      },
                  ]
                : [],
        allowEmpty: true,
    };
}
