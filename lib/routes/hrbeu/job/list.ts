// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';
const rootUrl = 'http://job.hrbeu.edu.cn';

const idMap = {
    tzgg: {
        name: '通知公告',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smMlyGfDy8QefMwSyc-jK8Ww=.shtml',
    },
    rdxw: {
        name: '热点新闻',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smLeM5XMyxaJMXP0thrbMBWI=.shtml',
    },
};

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got(idMap[id].url, {
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = load(response.data);

    const list = $('li.list_item.i1')
        .map((_, item) => {
            let link = $(item).find('a').attr('href');
            if (link.includes('HrbeuJY')) {
                link = `${rootUrl}${link}`;
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: parseDate($(item).find('.Article_PublishDate').text()),
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('HrbeuJY')) {
                    const detailResponse = await got(item.link);
                    const content = load(detailResponse.data);
                    item.description = content('.article').html();
                } else if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    await finishArticleItem(item);
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '就业服务平台-' + idMap[id].name,
        link: idMap[id].url,
        item: items,
    });
};
