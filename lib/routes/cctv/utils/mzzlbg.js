const got = require('@/utils/got');

module.exports = async () => {
    const url = 'http://api.cntv.cn/video/videolistById?serviceId=cbox&vsid=C10354&em=01&p=1&n=50';

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const resultItem = await Promise.all(
        data.video.map(async (video) => {
            const url = `http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${video.vid}`;
            const item = {
                title: video.t,
                description: '',
                link: video.url,
                pubDate: new Date(video.ptime).toUTCString(),
            };
            const { data: videoDetail } = await got({
                method: 'get',
                url,
            });

            item.description = `<video src="${videoDetail.hls_url}" controls="controls" poster="${video.img.replace(/\?.+/g, '')}" style="width: 100%"></video>`;
            return item;
        })
    );

    return {
        title: '每周质量报告',
        link: 'http://tv.cctv.com/lm/mzzlbg/videoset/index.shtml',
        description:
            '《每周质量报告》是CCTV-新闻频道一档以消费者为核心收视人群的新闻专题栏目。创办于2003年，始终致力于产品质量和食品安全领域的调查报道，以打假除劣扶优，推动质量进步为第一诉求，是我国电视新闻界质量新闻领域的旗帜性节目。首播时间：CCTV-新闻周日12:35—12:55。',
        item: resultItem,
    };
};
