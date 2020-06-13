/**
 * 这里列出部分已知用途且在 Feed 中有用的属性
 *
 * @typedef {Object} Card
 * @property {String} id 卡片 id
 * @property {String} title 卡片标题
 * @property {String} text 正文内容，会有换行符，里面的链接会是 <a-link href="..."></a-link> 的形式
 * @property {String} video 可能是内嵌视频地址
 * @property {String} video_thumb_img 可能是内嵌视频预览图片
 * @property {Number} bilibili_video_id 可能是关联的 Bilibili av 号
 * @property {String[]} images 内嵌图片地址
 * @property {Card~ImageInfo[]} images_info 内嵌图片信息
 * @property {String} url 原文网址
 * @property {String} url_cover 原文头图
 * @property {String} url_title 原文标题
 * @property {String} url_desc 原文简介
 * @property {String} url_host 原文网址的域名
 * @property {Number} created_time 创建的 Unix 时间戳
 *
 * @typedef {Object} Card~ImageInfo
 * @property {String} url
 * @property {String} format
 * @property {String} size
 * @property {Number} width
 * @property {Number} height
 */

const got = require('@/utils/got');

/**
 * @param {String} ctx.params.id
 */
module.exports = async (ctx) => {
    const id = ctx.params.id;

    const info_res = await got({
        method: 'post',
        url: 'https://kz.sync163.com/api/topic/info',
        headers: {
            from: 'h5',
            token: 'asdfasdfasdf',
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            topic_id: id,
        }),
    });
    const info = info_res.data;

    const cards_res = await got({
        method: 'post',
        url: 'https://kz.sync163.com/api/topic/cards',
        headers: {
            from: 'h5',
            token: 'asdfasdfasdf',
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            topic_id: id,
        }),
    });
    const cardList = cards_res.data.list;

    ctx.state.data = {
        title: `快知 - ${info.info.name}`,
        description: info.info.description,
        link: `https://kz.sync163.com/web/topic/${id}`,
        image: info.info.icon,
        item: cardList.map(buildFeedItem),
    };
};

/**
 * @param {Card} cardData
 */
const buildFeedItem = (cardData) => {
    const description = `
        <p><img src="${cardData.url_cover}" /></p>
        <p>${cardData.url_title ? cardData.url_title : ''}${cardData.url_desc ? ` - ${cardData.url_desc}` : ''}</p>
        <p style="white-space: pre-line">${serializeCardText(cardData.text)}</p>
        ${renderImageList(cardData.images)}
        <p><a href="https://kz.sync163.com/web/card/${cardData.id}" style="margin-left: 10px">快知中间页</a></p>
    `;

    return {
        title: cardData.title ? cardData.title : cardData.url_title,
        description,
        pubDate: new Date(cardData.created_time * 1000),
        link: cardData.url,
    };
};

const renderImageList = (images) => {
    const renderItem = (src) => `
        <li style="width: 30%; margin: 0.5rem">
        <img style="width: 100%" src="${src}" />
        </li>
        `;

    return `
        <ul style="
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
        ">
        ${images.map(renderItem).join('')}
        </ul>
        `;
};

const serializeCardText = (text) =>
    text

        /* 快知的 API 里的 a 标签名字叫做 a-link ，我们要把它改过来 */
        .replace(/<a-link/g, '<a')
        .replace(/<\/a-link>/g, '</a>')

        /* 替换换行符 */
        .replace(/\n/g, '<br>');
