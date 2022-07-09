const got = require('@/utils/got');
const { JSDOM } = require('jsdom');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.vlive.tv';

module.exports = async (ctx) => {
    const { channel, board } = ctx.params;
    const link = `${baseUrl}/channel/${channel}/board/${board}`;

    const response = await got(link);
    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });
    const preloadedState = dom.window.__PRELOADED_STATE__;
    const channelData = preloadedState.channel.channel;
    const userCountry = preloadedState.common.userCountry;
    const userLanguage = preloadedState.common.userLanguage;

    const apiResponse = await got(`${baseUrl}/globalv-web/vam-web/post/v1.0/board-${board}/posts`, {
        searchParams: {
            appId: '8c6cc7b45d2568fb668be6e05b6e5a3b',
            fields: 'attachments,author,availableActions,board{boardId,title,boardType,payRequired,includedCountries,excludedCountries},channel{channelName,channelCode},totalCommentCount,contentType,createdAt,emotionCount,excludedCountries,includedCountries,isCommentEnabled,isHiddenFromStar,lastModifierMember,notice,officialVideo,plainBody,postId,postVersion,reservation,starReactions,targetMember,thumbnail,title,url,writtenIn,sharedPosts,originPost,blindType',
            sortType: 'LATEST',
            limit: ctx.query.limit ? Number(ctx.query.limit) : 20,
            gcc: userCountry,
            locale: userLanguage,
        },
        headers: {
            referer: link,
        },
    });

    const items = apiResponse.data.data.map((item) => {
        let description;
        switch (item.contentType) {
            case 'POST':
                description = art(path.join(__dirname, 'templates/post.art'), {
                    post: item.plainBody?.replace(/\r\n/g, '<br><br>').replace(/\n/g, '<br>'),
                    images: item.attachments.photo,
                });
                break;
            case 'VIDEO':
                description = art(path.join(__dirname, 'templates/video.art'), {
                    link: item.url,
                    image: item.officialVideo.thumb,
                });
                break;
            default:
                throw `Unknown content type: ${item.contentType}`;
        }

        return {
            title: item.title,
            description,
            link: item.url,
            author: item.author.nickname,
            pubDate: parseDate(item.createdAt),
        };
    });

    ctx.state.data = {
        title: `${channelData.channelName} Channel`,
        description: channelData.channelDescription,
        link,
        image: channelData.channelProfileImage,
        item: items,
    };
};
