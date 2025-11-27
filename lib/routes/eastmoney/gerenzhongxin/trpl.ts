import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gerenzhongxin/trpl/:uid',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/gerenzhongxin/trpl/2922094262312522',
    parameters: { uid: '用户id,即用户主页网址末尾的数字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['guba.eastmoney.com'],
        },
        {
            source: ['caifuhao.eastmoney.com'],
        },
        {
            source: ['i.eastmoney.com/:uid'],
            target: '/gerenzhongxin/trpl/:uid',
        },
    ],
    name: '个人中心评论',
    maintainers: ['AwesomeDog'],
    handler,
};

export async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const url = `https://i.eastmoney.com/api/guba/myreply?pageindex=1&uid=${uid}&checkauth=true`;

    const response = await got(url);
    const arr = response.data.result.list;
    const nickname = arr[0].reply_user.user_nickname;

    const items = arr.map((item) => {
        const linkUrl = `https://guba.eastmoney.com/news,${item.reply_guba.stockbar_code},${item.source_post_id}.html#allReplyList`;
        const descriptionContent = `
        <p>${item.source_post_title}</p>
        <hr/>
        <br/>
        <blockquote cite="${linkUrl}">
          <p>${item.reply_text}</p>
        </blockquote>
        <p style="text-align:right;">—— 评论者：<cite>${item.reply_user.user_nickname}</cite></p>
        `;

        const guid: string = 'guid-' + md5(item.reply_text) + `-${item.source_post_id}`;

        return {
            title: item.post_title || `${nickname} 发布了评论: ${descriptionContent}`,
            description: descriptionContent,
            pubDate: timezone(parseDate(item.reply_publish_time), 8),
            link: linkUrl,
            guid,
            author: item.reply_user.user_nickname,
        };
    });

    return {
        title: `${nickname} 的东财评论`,
        link: `https://i.eastmoney.com/${uid}#trpl`,
        image: `https://avator.eastmoney.com/qface/${uid}/360`,
        item: items,
    };
}
