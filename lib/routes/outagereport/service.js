const got = require('@/utils/got');

const baseUrl = 'https://outage.report/';

module.exports = async (ctx) => {
    const serviceName = ctx.params.name; // Which service do you want to monitor? Have to be the same as what it appears in URL.
    const watchCount = ctx.params.count || 10; // How many reports is received during last 20 minutes? 10 reports as default.
    const URL = `${baseUrl}${serviceName}`;
    const response = await got({
        method: 'get',
        url: URL,
    });

    const html = response.data;

    // use RegExp because of irregular class name
    const gaugeRegexp = new RegExp(`class="Gauge__Count.*?>(\\d+)</text>`); // Core Pattern
    const gaugeTextRegexp = new RegExp(`class="Gauge__MessageWrapper.*?class="Gauge__Message.*?>(.*?)</span>`); // Core Pattern
    const rssDescribeRegexp = new RegExp(`<p class="PageSubheader.*?>(.*?)</p>`);

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
            guid: new Date().getTime(),
            link: URL,
        };
        outageHistory.push(outageReportItem);
    }

    // how this RSS feed looks like
    ctx.state.data = {
        title: `Is ${serviceName} Down Right Now?`,
        link: URL,
        description: rssDescribe,
        item: outageHistory,
        allowEmpty: true,
    };
};
