// @ts-nocheck
import got from '@/utils/got';

const baseUrl = 'https://outage.report/';

export default async (ctx) => {
    const serviceName = ctx.req.param('name'); // Which service do you want to monitor? Have to be the same as what it appears in URL.
    const watchCount = ctx.req.param('count') || 10; // How many reports is received during last 20 minutes? 10 reports as default.
    const url = `${baseUrl}${serviceName}`;
    const response = await got({
        method: 'get',
        url,
    });

    const html = response.data;

    // use RegExp because of irregular class name
    const gaugeRegexp = /class="Gauge__Count.*?>(\d+)<\/text>/; // Core Pattern
    const gaugeTextRegexp = /class="Gauge__MessageWrapper.*?class="Gauge__Message.*?>(.*?)<\/span>/; // Core Pattern
    const rssDescribeRegexp = /<p class="PageSubheader.*?>(.*?)<\/p>/;

    // data to be shown on RSS feed and RSS items
    const gaugeCount = Number(html.match(gaugeRegexp)[1]);
    const gaugeText = html.match(gaugeTextRegexp)[1];
    const rssDescribe = html.match(rssDescribeRegexp)[1];

    // list ("Array" in js, though) of items
    const outageHistory = [];

    // 2020-09-17 output as long as it exists, avoid reporting errors
    // compatible with optional variables
    if (gaugeCount >= watchCount) {
        // alert only when it counts
        const outageReportItem = {
            title: `${serviceName} appear to be (partially) down`,
            description: String(gaugeCount) + ' ' + gaugeText,
            pubDate: new Date().toUTCString(),
            guid: Date.now(),
            link: url,
        };
        outageHistory.push(outageReportItem);
    }

    // how this RSS feed looks like
    ctx.set('data', {
        title: `Is ${serviceName} Down Right Now?`,
        link: url,
        description: rssDescribe,
        item: outageHistory,
        allowEmpty: true,
    });
};
