/* eslint-disable no-var */
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const get_sec_page_data = require("./get_sec_page_data");

const rootUrl = 'https://oreno3d.com';

const sortRename = {
    favorites: '高評価',
    hot: '急上昇',
    latest: '新着',
    popularity: '人気',
};

function get_user_url(rootUrl, ctx, sort) {
    let userUrl = "";
    // 判断userurl获取位置
    if (ctx.params.keyword) {
        const keyword = ctx.params.keyword;
        userUrl = `${rootUrl}/search?sort=${sort}&keyword=${keyword}`;
    }
    else if (ctx.params.characterid) {
        const characterid = ctx.params.characterid;
        userUrl = `${rootUrl}/characters/${characterid}?sort=${sort}`;
    }
    else if (ctx.params.authorid) {
        const authorid = ctx.params.authorid;
        userUrl = `${rootUrl}/authors/${authorid}?sort=${sort}`;
    }
    else if (ctx.params.tagid) {
        const tagid = ctx.params.tagid;
        userUrl = `${rootUrl}/tags/${tagid}?sort=${sort}`;
    }
    else if (ctx.params.originid) {
        const originid = ctx.params.originid;
        userUrl = `${rootUrl}/origins/${originid}?sort=${sort}`;
    }
    return userUrl;
}
module.exports = async (ctx) => {
    async function getData(userUrl) {
        const selector = 'a.box';
        const response = await got(userUrl);
        const $ = cheerio.load(response.data);
        // 第一页，获取搜索主标题
        const title = $("div.g-main-list").find("h1.main-h").text();// 搜索标题;//第二页跳转链接
        const list = $(selector);
        const items = await Promise.all(
            list.map(async(_, item) => {
                // 第一页，获取搜各视频地址
                const link = $(item).attr('href');
                // 第二页数据分析+缓存
                const sec_data = await ctx.cache.tryGet(link, async () => {
                    const result = await get_sec_page_data(link); // 未命中操作
                    return result;
                });
                // 传递
                const raw_pic_link = sec_data.raw_pic_link;
                const video_name = sec_data.video_name;
                const authors = sec_data.authors;
                const origins = sec_data.origins;
                const characters = sec_data.characters;
                const tags = sec_data.tags;
                const desc = sec_data.desc;
                const iwara_link = sec_data.iwara_link;
                const oreno3d_link = sec_data.oreno3d_link;
                // 打包
                return {
                    title: `${video_name} - ${authors}`,
                    author:authors,
                    link: oreno3d_link,
                    category: tags.split(' '),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        raw_pic_link,
                        video_name,
                        authors,
                        origins,
                        characters,
                        tags,
                        desc,
                        iwara_link,
                        oreno3d_link
                    }),
                };

        }).get(),
    );
    return {items, title};
    }
    // 参数定义
    const sort = ctx.params.sort;
    let maxlimit = ctx.params.maxlimit ?? 1;
    // 根链接
    const userUrl = get_user_url(rootUrl, ctx, sort);
    // 确认最大页数并比较修改
    const response = await got(userUrl);
    const $ = cheerio.load(response.data);
    const maxPageSelector = "div.container > main > div.g-main-list > ul.pagination > li:last-child > a";
    if ($(maxPageSelector)) {
        const pageLink = $(maxPageSelector).attr('href');
        const actualNum = pageLink.split("&page=")[1];
        if (maxlimit > actualNum) {maxlimit = actualNum;};// 超出则用最大的
    }
    else {maxlimit = 1;} // 只有一页}
    // 分页
    for (let i = 0; i < maxlimit; i++) {
        // eslint-disable-next-line no-await-in-loop
        var data = await getData(`${userUrl}&page=${i + 1}`);
    }
    // 生成RSS源码
    ctx.state.data = {
        // eslint-disable-next-line block-scoped-var
        title: `${data.title} - ${sortRename[sort]}(Page 1-${maxlimit})`,
        link: userUrl,
        // eslint-disable-next-line block-scoped-var
        item: data.items,
    };
};
