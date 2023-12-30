const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { art } = require('@/utils/render');
const path = require('path');
const renderDesc = (content) => art(path.join(__dirname, 'templates/description.art'), content);

module.exports = async (ctx) => {
    let yesterday = dayjs().subtract(1, 'day');
    const dayBefore = yesterday.subtract(1, 'day').format('YYYY-MM-DD');
    yesterday = yesterday.format('YYYY-MM-DD');

    const source = ctx.params.source.toUpperCase();
    const target = ctx.params.target.toUpperCase();

    const link = 'https://wise.com/tools/exchange-rate-alerts/';
    const guid = `wise:rates:${ctx.params.source}-${ctx.params.target}-${yesterday}`;
    const single = await ctx.cache.tryGet(guid, async () => {
        const { data } = await got('https://wise.com/rates/history', {
            searchParams: {
                source,
                target,
                length: 1,
                unit: 'year',
                resolution: 'daily',
            },
            headers: {
                referer: link,
            },
        });

        const yData = data[data.length - 1];
        const byDate = data[data.length - 2];
        const yRate = yData.value;
        const byRate = byDate.value;
        const trend = yRate > byRate;
        const diff = (yRate - byRate) / yRate;

        const percent = (Math.abs(diff) * 100).toFixed(4);

        return {
            title: `${source}/${target} ${trend ? '📈' : '📉'} @${yRate} ${diff > 0 ? '' : '-'}${percent}%`,
            description: renderDesc({
                source,
                target,
                yesterday,
                yRate,
                dayBefore,
                byRate,
            }),
            pubDate: parseDate(yData.time, 'x'),
            guid,
            link,
        };
    });

    ctx.state.data = {
        title: `${source} to ${target} by Wise`,
        link,
        description: `Exchange Rate from Wise`,
        item: [single],
    };
};
