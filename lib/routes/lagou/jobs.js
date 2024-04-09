const got = require('@/utils/got');

async function getCookie(url, ctx) {
    const cache_key = `lagou-cookie-${new Date().toLocaleDateString()}`;
    const cached_cookie = await ctx.cache.get(cache_key);
    if (cached_cookie) {
        return cached_cookie;
    }
    const { headers } = await got.get(url, { headers: { Referer: 'https://www.lagou.com/' } });
    const cookie = headers['set-cookie']
        .filter((c) => c.match(/(user_trace_token|X_HTTP_TOKEN)/))
        .map((c) => c.split(';')[0])
        .join('; ');
    ctx.cache.set(cache_key, cookie);
    return cookie;
}

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const position = ctx.params.position;

    const url = `https://www.lagou.com/jobs/list_${encodeURIComponent(position)}?px=new&city=${encodeURIComponent(city)}`;

    const cookie = await getCookie(url, ctx);

    const response = await got({
        method: 'post',
        url: `https://www.lagou.com/jobs/positionAjax.json?px=new&city=${encodeURIComponent(city)}&needAddtionalResult=false`,
        headers: {
            Referer: url,
            Cookie: cookie,
        },
        form: {
            first: true,
            pn: 1,
            kd: position,
        },
    });

    if (!response.data.success) {
        throw response.data.msg;
    }

    const list = response.data.content.positionResult.result;

    ctx.state.data = {
        title: `${position} - ${city} - 拉勾网`,
        link: url,
        item: list.map((item) => ({
            title: `${item.positionName}[${city === '全国' ? item.city + '·' : ''}${item.businessZones ? item.businessZones[0] : item.district}] - ${item.companyShortName}`,
            author: item.companyShortName,
            description: `薪资：${item.salary}<br>要求：${item.workYear} / ${item.education}<br>公司名称：${item.companyFullName}<br>公司描述：${item.industryField} / ${item.financeStage} / ${item.companySize}${
                item.companyLabelList && item.companyLabelList.length !== 0 ? '<br>公司标签：' + item.companyLabelList.join(', ') : ''
            }<br>职位优势：${item.positionAdvantage}${item.positionLables ? '<br>职位标签：' + item.positionLables.join(', ') : ''}${item.linestaion ? '<br>附近线路：' + item.linestaion : ''}`,
            link: `https://www.lagou.com/jobs/${item.positionId}.html`,
            pubDate: new Date(item.createTime),
        })),
    };
};
