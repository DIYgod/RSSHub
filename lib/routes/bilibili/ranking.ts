import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/ranking/:rid?/:day?/:arc_type?/:disableEmbed?',
    name: '排行榜',
    maintainers: ['DIYgod'],
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    example: '/bilibili/ranking/0/3/1',
    parameters: {
        rid: {
            description: '排行榜分区 id',
            default: '0',
            options: [
                {
                    label: '全站',
                    value: '0',
                },
                {
                    label: '动画',
                    value: '1',
                },
                {
                    label: '国创相关',
                    value: '168',
                },
                {
                    label: '音乐',
                    value: '3',
                },
                {
                    label: '舞蹈',
                    value: '129',
                },
                {
                    label: '游戏',
                    value: '4',
                },
                {
                    label: '科技',
                    value: '36',
                },
                {
                    label: '数码',
                    value: '188',
                },
                {
                    label: '生活',
                    value: '160',
                },
                {
                    label: '鬼畜',
                    value: '119',
                },
                {
                    label: '时尚',
                    value: '155',
                },
                {
                    label: '娱乐',
                    value: '5',
                },
                {
                    label: '影视',
                    value: '181',
                },
            ],
        },
        day: {
            description: '时间跨度',
            default: '3',
            options: [
                {
                    value: '1',
                    label: '1日',
                },
                {
                    value: '3',
                    label: '3日',
                },
                {
                    value: '7',
                    label: '7日',
                },
                {
                    value: '30',
                    label: '30日',
                },
            ],
        },
        arc_type: {
            description: '投稿时间',
            default: '1',
            options: [
                {
                    value: '0',
                    label: '全部投稿',
                },
                {
                    value: '1',
                    label: '近期投稿',
                },
            ],
        },
        disableEmbed: {
            description: '默认为开启内嵌视频, 任意值为关闭',
        },
    },
    handler,
};

async function handler(ctx) {
    const rid = ctx.req.param('rid') || '0';
    const day = ctx.req.param('day') || '3';
    const arc_type = ctx.req.param('arc_type') || '1';
    const disableEmbed = ctx.req.param('disableEmbed');
    const arc_type1 = arc_type === '0' ? '全部投稿' : '近期投稿';
    const rid_1 = ['0', '1', '168', '3', '129', '4', '36', '188', '160', '119', '155', '5', '181'];
    const rid_2 = ['全站', '动画', '国创相关', '音乐', '舞蹈', '游戏', '科技', '数码', '生活', '鬼畜', '时尚', '娱乐', '影视'];
    const rid_i = rid_1.indexOf(rid + '');
    const rid_type = rid_2[rid_i];
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp&rid=${rid}&day=${day}&type=1&arc_type=${arc_type}&callback=__jp0`,
        headers: {
            Referer: `https://www.bilibili.com/ranking/all/${rid}/${arc_type}/${day}`,
        },
    });

    const data = JSON.parse(response.data.match(/^__jp0\((.*)\)$/)[1]).data || {};
    let list = data.list || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].others && list[i].others.length) {
            for (const item of list[i].others) {
                item.author = list[i].author;
            }
            list = [...list, ...list[i].others];
        }
    }
    return {
        title: `bilibili ${day}日排行榜-${rid_type}-${arc_type1}`,
        link: `https://www.bilibili.com/ranking/all/${rid}/0/${day}`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.description || item.title}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid, null, item.bvid)}`}<br><img src="${item.pic}">`,
            pubDate: item.create && new Date(item.create).toUTCString(),
            author: item.author,
            link: !item.create || (new Date(item.create) / 1000 > utils.bvidTime && item.bvid) ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
}
