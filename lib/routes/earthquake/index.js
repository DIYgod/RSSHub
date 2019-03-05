const axios = require('../../utils/axios');
const qs = require('querystring');

module.exports = async (ctx) => {
    const region = ctx.params.region || 1;
    const api = 'https://www.cea.gov.cn/eportal/ui?struts.portlet.mode=view&struts.portlet.action=/portlet/expressEarthquake!queryExpressEarthquakeList.action&pageId=363409&moduleId=a852ba487b534470a84a30f00e7d6670';
    const link = 'https://www.cea.gov.cn/cea/xwzx/zqsd/index.html';
    const response = await axios({
        method: 'post',
        url: api,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            region: region,
            dateType: 2,
            magnitude: 0,
        }),
    });

    const data = response.data;

    const out = await Promise.all(
        data.map(async (item) => {
            const id = item.id;
            const epicenter = item.epicenter;
            const date = item.orig_time.slice(0, -2);
            const num = item.num_mag;
            const latitudes = item.latitudes;
            const longitudes = item.longitudes;
            const depth = item.depth;

            const description = `北京时间${date}，${epicenter}（纬度${latitudes}度，经度${longitudes}度）发生${num}级地震，震源深度${depth}千米`;
            const single = {
                title: `${epicenter}发生${num}级地震`,
                link: `https://www.cea.gov.cn/eportal/ui?struts.portlet.mode=view&struts.portlet.action=/portlet/expressEarthquake!toNewInfoView.action&pageId=366521&id=${id}`,
                pubDate: new Date(date).toUTCString(),
                description: description,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国地震局震情速递',
        link,
        item: out,
    };
};
