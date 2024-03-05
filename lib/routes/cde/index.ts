// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const channelLinkMap = {
    news: 'https://www.cde.org.cn/main/news/listpage/545cf855a50574699b46b26bcb165f32',
    policy: 'https://www.cde.org.cn/main/policy/listpage/9f9c74c73e0f8f56a8bfbc646055026d',
};

const cateUrlMap = {
    news: {
        zwxw: 'getList',
        ywdd: 'getHotNewsList',
        tpxw: 'getPictureNewsList',
        gzdt: 'getWorkList',
    },
    policy: {
        flfg: 'getPolicyList',
        zxgz: 'getRuleList',
    },
};

const cateTitleMap = {
    news: {
        zwxw: '政务新闻',
        ywdd: '要闻导读',
        tpxw: '图片新闻',
        gzdt: '工作动态',
    },
    policy: {
        flfg: '法律法规',
        zxgz: '政策规章',
    },
};

const requestData = {
    news: {
        zwxw: {
            pageSize: 25,
            pageNum: 1,
            classId: '545cf855a50574699b46b26bcb165f32',
        },
        ywdd: {
            pageSize: 25,
            pageNum: 1,
            ishot: 1,
        },
        tpxw: {
            pageSize: 25,
            pageNum: 1,
        },
        gzdt: {
            pageSize: 25,
            pageNum: 1,
            classId: '8dc6aac86eb083759b1e01615617a347',
        },
    },
    policy: {
        flfg: {
            pageNum: 1,
            pageSize: 25,
            fclass: 0,
            keyName: 'TITLE',
            logicC: 'bh',
        },
        zxgz: {
            pageNum: 1,
            pageSize: 25,
            fclass: 0,
            keyName: 'TITLE',
            logicC: 'bh',
        },
    },
};

export default async (ctx) => {
    const channel = ctx.req.param('channel');
    const cate = ctx.req.param('category');
    requestData[channel][cate].pageSize = ctx.req.param('limit') ?? 25;

    const url = `${utils.rootUrl}/main/${channel}/${cateUrlMap[channel][cate]}`;
    const response = await got({
        method: 'post',
        url,
        headers: {
            cookie: await utils.getCookie(ctx),
        },
        form: requestData[channel][cate],
    });
    const data = response.data.data;
    const list = data.records.map((item) => {
        const linkMap = {
            news: `${utils.rootUrl}/main/${item.isPic ? 'newspic/view/' : 'news/viewInfoCommon/'}${item.newsIdCode}`,
            policy: `${utils.rootUrl}/main/${item.regulatIdCODE ? `policy/regulatview/${item.regulatIdCODE}` : `policy/view/${item.policyIdCODE}`}`,
        };

        return {
            title: item.title,
            link: linkMap[channel],
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        cookie: await utils.getCookie(ctx),
                    },
                });
                const $ = load(detailResponse.data);

                item.pubDate = parseDate($('div.news_detail_date').text(), 'YYYYMMDD');

                const desc = $('div.news_detail_box');
                const removeTitle = desc.find('div.news_detail_title').remove().end();
                const removeDate = removeTitle.find('div.news_detail_date').remove().end();
                const removeImage = removeDate.find('img').remove().end();
                item.description = removeImage.html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${utils.title} - ${cateTitleMap[channel][cate]}`,
        link: channelLinkMap[channel],
        item: items,
    });
};
