// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { extractDoc, renderVideo } = require('./utils');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const { id, type } = ctx.req.param();
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

    const $ = load(userResponse);
    const { sockpuppetInfo: allData } = JSON.parse(
        $('script')
            .text()
            .match(/var allData = (.*?);/)[1]
    );
    const { data: contentData } = JSON.parse(contentResponse.match(/getListData\((.*)\)/)[1]);
    const { weMediaName: mediaName, honorDesc, description, logo } = allData;

    const list = contentData.map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.newsTime), +8),
        author: mediaName,
        link: `https:${item.url}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const _allData = JSON.parse(
                    $('script')
                        .text()
                        .match(/var allData = ({.*?});/)[1]
                );
                if (type === 'doc') {
                    item.description = extractDoc(_allData.docData.contentData.contentList);
                }
                if (type === 'video') {
                    item.description = renderVideo(_allData.videoInfo);
                }

                item.category = _allData.keywords.split(',');
                item.author = _allData.docData?.editorName ?? item.author;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `大风号-${mediaName}-${type === 'doc' ? '文章' : '视频'}`,
        description: `${honorDesc} ${description}`,
        image: `https:${logo}`,
        link: `https://ishare.ifeng.com/mediaShare/home/${id}/media`,
        item: items,
    });
};
