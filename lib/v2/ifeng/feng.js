const got = require('@/utils/got');
const cheerio = require('cheerio');
const { extractDoc, renderVideo } = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id, type } = ctx.params;
    const { data: userResponse } = await got(`https://ishare.ifeng.com/mediaShare/home/${id}/media`, {
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });
    const { data: contentResponse } = await got(`https://shankapi.ifeng.com/season/ishare/getShareListData/${id}/${type}/1/ifengnewsh5/getListData`, {
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });

    const $ = cheerio.load(userResponse);
    const { sockpuppetInfo: allData } = JSON.parse(
        $('script')
            .text()
            .match(/var allData = (.*?);/)[1]
    );
    const { data: contentData } = JSON.parse(contentResponse.match(/getListData\((.*)\)/)[1]);
    const { weMediaName: mediaName } = allData;

    const list = contentData.map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.newsTime), +8),
        author: mediaName,
        link: `https:${item.url}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const allData = JSON.parse(
                    $('script')
                        .text()
                        .match(/var allData = ({.*?});/)[1]
                );
                if (type === 'doc') {
                    item.description = extractDoc(allData.docData.contentData.contentList);
                }
                if (type === 'video') {
                    item.description = renderVideo(allData.videoInfo);
                }

                item.category = allData.keywords.split(',');
                item.author = allData.docData?.editorName ?? item.author;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `大风号-${mediaName}-${type === 'doc' ? '文章' : '视频'}`,
        description: `${allData.honorDesc} ${allData.description}`,
        image: `https:${allData.logo}`,
        link: `https://ishare.ifeng.com/mediaShare/home/${id}/media`,
        item: items,
    };
};
