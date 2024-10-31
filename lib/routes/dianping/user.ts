import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';

export const route: Route = {
    path: '/user/:id',
    categories: ['shopping'],
    example: '/dianping/user/808259118',
    parameters: { id: 'User id，打开网页端从 URL 中获取，在 `/member/:id` 中' },
    features: {
        requireConfig: [
            {
                name: 'DIANPING_COOKIE',
                optional: false,
                description: '大众点评的 Cookie',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dianping.com/member/:id', 'm.dianping.com/userprofile/:id'],
            target: '/dianping/user/:id',
        },
    ],
    name: '用户动态',
    maintainers: ['pseudoyu'],
    handler,
    description: '获取用户点评、签到、攻略等动态。',
};

function addPictureAndVideo(item: any) {
    let content = '';
    content += item.pictureList ? item.pictureList.map((ele: any) => `<img src="${ele.picUrl}" />`).join('<br>') : '';
    content += item.videoUrl ? `<img src="${item.videoUrl}" />` : '';
    return content;
}

const starMap: Record<number, string> = {
    0: '无',
    10: '一星',
    20: '二星',
    30: '三星',
    35: '三星半',
    40: '四星',
    45: '四星半',
    50: '五星',
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    const userPage = `https://m.dianping.com/userprofile/${id}`;
    const cookie = config.dianping.cookie;

    const headers: Record<string, string> = {
        'User-Agent': userAgent,
        Referer: userPage,
    };

    if (cookie) {
        headers.Cookie = cookie;
    }

    const pageResponse = await ofetch(userPage, {
        headers,
    });

    const nickNameReg = /window\.nickName = "(.*?)"/g;
    const nickName = nickNameReg.exec(pageResponse as string)?.[1];

    const response = await ofetch(`https://m.dianping.com/member/ajax/NobleUserFeeds?userId=${id}`, {
        headers,
    });

    const data = response.data;

    const items = data.map((item: any) => {
        let link = '';
        let title = '';
        let content = '';

        const poi = item.poi ? `地点：<a href="http://www.dianping.com/shop/${item.poi.shopId}">${item.poi.name} - ${item.poi.regionCategory}</a>` : '';
        const poiName = item.poi ? item.poi.name : '';

        switch (item.feedType) {
            case 1101:
                // 签到成功
                link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=3`;
                content = poi;
                title = `签到成功: ${poiName} `;

                break;

            case 101:
                // 对商户、地点发布点评
                link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=1`;
                content = item.content.replaceAll(/\n+/g, '<br>') + '<br>';
                content += `评分：${starMap[item.star]}<br>`;
                content += poi + '<br>';
                content += addPictureAndVideo(item);
                title = `发布点评: ${poiName}`;

                break;

            case 131:
                // 发布点评
                link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=29`;
                content = item.content.replaceAll(/\n+/g, '<br>') + '<br>';
                content += addPictureAndVideo(item);
                title = `发布点评: ${content}`;

                break;

            case 4208:
                // 发布攻略
                link = `https://m.dianping.com/cityinsight/${item.mainId}`;
                content = item.content.replaceAll(/\n+/g, '<br>') + '<br>';
                content += poi + '<br>';
                content += item.moreDesc ? `<a href='${link}'>${item.moreDesc}</a><br>` : '';
                content += addPictureAndVideo(item);
                title = `发布攻略: ${poiName}`;

                break;

            default:
            // Do nothing
        }

        return {
            description: content,
            title,
            link,
        };
    });

    return {
        title: `大众点评 - ${nickName}`,
        link: userPage,
        description: `大众点评 - ${nickName}`,
        item: items,
    };
}
