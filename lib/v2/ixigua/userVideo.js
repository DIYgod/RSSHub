const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.ixigua.com';

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const url = `${host}/home/${uid}/?wid_try=1`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const jsData = $('#SSR_HYDRATED_DATA')
        .html()
        .replace('window._SSR_HYDRATED_DATA=', '')
        .replace(/undefined/g, '""');
    const data = JSON.parse(jsData);

    const videoInfos = data.AuthorVideoList.videoList;
    const userInfo = data.AuthorDetailInfo;

    ctx.state.data = {
        title: `${userInfo.name} 的西瓜视频`,
        link: url,
        description: userInfo.introduce,
        item: videoInfos.map((i) => ({
            title: i.title,
            description: art(path.join(__dirname, 'templates/userVideo.art'), {
                i,
                disableEmbed,
            }),
            link: `${host}/${i.groupId}`,
            pubDate: parseDate(i.publishTime * 1000),
            author: userInfo.name,
        })),
    };
};
