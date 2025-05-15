const got = require('@/utils/got');

module.exports = async (ctx) => {
    const data = (
        await got({
            method: 'get',
            url: 'https://pay.weixin.qq.com/index.php/public/cms/get_contents?id=6200&cmstype=1&url=https%253A%252F%252Fpay.weixin.qq.com%252Fpublic%252Fcms%252Fcontent_list%253Flang%253Dzh%2526id%253D6200&states=2&publishtimeend=1565537507&expiretimebeg=1565537507&propertyinclude=1&ordertype=4&field=contentId%2CcontentTitle%2CcontentPublishTime&g_ty=ajax',
        })
    ).data.data.contentlist;

    const data2 = (
        await got({
            method: 'get',
            url: 'https://pay.weixin.qq.com/index.php/public/cms/get_contents?pagenum=1&id=6200&cmstype=1&url=https%253A%252F%252Fpay.weixin.qq.com%252Fpublic%252Fcms%252Fcontent_list%253Flang%253Dzh%2526id%253D6200&states=2&publishtimeend=1565537507&expiretimebeg=1565537507&propertyexclude=1&ordertype=4&field=contentId%2CcontentTitle%2CcontentPublishTime&g_ty=ajax',
        })
    ).data.data.contentlist;

    data.push(...data2);

    ctx.state.data = {
        title: '微信支付-商户平台公告',
        link: 'https://pay.weixin.qq.com/public/cms/content_list?lang=zh&id=6200',
        item: data.map((item) => ({
            title: item.contentTitle,
            description: item.contentTitle,
            pubDate: new Date(item.contentPublishTime * 1000).toUTCString(),
            link: `https://pay.weixin.qq.com/index.php/public/cms/content_detail?platformType=0&lang=zh&id=${item.contentId}`,
        })),
    };
};
