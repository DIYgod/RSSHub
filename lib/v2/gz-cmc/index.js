const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    let channel = '';
    let site = '';
    let siteName = '广州市融媒体中心';
    let siteLink = 'https://www.gz-cmc.com/';
    switch (ctx.params.site) {
        case 'huacheng':
        case 'xinhuacheng':
        case 'hc':
        case 'guangzhou':
        case 'gz':
        case '':
            channel = ctx.params.channel ?? 'shouye';
            site = 'huacheng';
            siteName = '广州日报——新花城';
            siteLink = `https://huacheng.gz-cmc.com/channel/${channel}/index.html`;
            break;

        case 'daohuangpuqu':
        case 'huangpu':
        case 'hp':
            channel = ctx.params.channel ?? 'sy';
            if (channel === 'wanqushibao' || channel === 'wqsb') {
                channel = 'hpxsd';
            }
            site = 'daohuangpuqu';
            siteName = '黄埔融媒——到黄埔去';
            siteLink = 'https://www.gz-cmc.com/html/download.html?siteId=cd4f63bdfdfd41749c7e304bc0d7a6df'; // no website available for this site
            break;

        case 'zhangshangfanyu':
        case 'zhangshangpanyu':
        case 'panyu':
        case 'py':
            channel = ctx.params.channel ?? 'shouye';
            site = 'zhangshangfanyu'; // not a typo here...
            siteName = '番禺融媒——掌上番禺';
            siteLink = 'https://www.gz-cmc.com/html/download.html?siteId=d755df8bb9fb49ee96052f7dee58d21b'; // no website available for this site
            break;

        case 'yuezengcheng':
        case 'zengcheng':
        case 'zc':
            channel = ctx.params.channel ?? 'shouye';
            site = 'yuezengcheng';
            siteName = '增城融媒——阅增城';
            siteLink = 'https://www.gz-cmc.com/html/download.html?siteId=78fa6d06b0dd4f27abf341e5efde035a'; // no website available for this site
            break;

        case 'guangzhoubaiyun':
        case 'baiyun':
        case 'by':
            channel = ctx.params.channel ?? 'sy';
            site = 'guangzhoubaiyun';
            siteName = '白云融媒——广州白云';
            siteLink = `https://guangzhoubaiyun.gz-cmc.com/channel/${channel}/index.html`;
            break;

        default:
            channel = ctx.params.channel;
            site = ctx.params.site;
            break;
    }
    const apiUrl = `https://${site}.gz-cmc.com/json/channel/${channel}/list.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let result = [];
    if (site === 'daohuangpuqu' && channel === 'hpxsd') {
        const { data: newResponse } = await got(response.data.list[0].data.detailJsonPath);
        result = newResponse.dataList;
        if (newResponse.nextJsonUrl) {
            const { data: nextResponse } = await got(newResponse.nextJsonUrl);
            result = [...result, ...nextResponse.dataList];
        }
    } else {
        result = response.data.list;
    }

    const list = result
        .filter((i) => i.data.contentType === 1 && i.data.linkType === 0)
        .map((item) => ({
            title: item.data.title,
            description: art(path.join(__dirname, 'templates/description.art'), {
                thumb: item.data.mCoverImg,
            }),
            pubDate: timezone(parseDate(item.data.lastpublishTime), +8),
            link: item.data.url,
            author: item.data.author,
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);
                content('.broadcast-container').remove();

                if (content('meta[name="description"]').attr('content')) {
                    item.description += '<blockquote>' + content('meta[name="description"]').attr('content') + '</blockquote>';
                }
                item.description += content('.article-source').html() ?? '';

                if (site === 'daohuangpuqu') {
                    const articleContent = content('script')
                        .text()
                        .match(/contentTxt ="(.*)";/);
                    item.description += articleContent ? articleContent[1].replace(/\\/g, '') : '';
                } else {
                    item.description += content('#articleContent').html();
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: siteName,
        link: siteLink,
        item: items,
    };
};
