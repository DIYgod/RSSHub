import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gerenzhongxin/cfh/:uid',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/gerenzhongxin/cfh/2922094262312522',
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
            target: '/gerenzhongxin/cfh/:uid',
        },
    ],
    name: '个人中心长文',
    maintainers: ['AwesomeDog'],
    handler,
};

export async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const url = `https://i.eastmoney.com/api/guba/postCenterList?uid=${uid}&pagenum=1&pagesize=10&type=1&filterType=1&onlyYt=0`;

    const response = await got(url);
    const arr = response.data.result;
    // console.log(arr[0].post_user);
    const nickname = arr[0].post_user.user_nickname;

    const items = arr.map((item) => {
        let descriptionContent = item.post_content;
        if (item.post_pic_url && item.post_pic_url.length > 0) {
            const imagesHTML = item.post_pic_url.map((url: string) => `<img src="${url}">`).join('');
            descriptionContent += '<br>' + imagesHTML;
        }

        return {
            title: item.post_title || `${nickname} 发布了长文: ${descriptionContent}`,
            description: descriptionContent,
            pubDate: timezone(parseDate(item.post_publish_time), 8),
            link: `https://caifuhao.eastmoney.com/news/${item.post_source_id}`,
            author: item.post_user.user_nickname,
        };
    });

    return {
        title: `${nickname} 的东财长文`,
        link: `https://i.eastmoney.com/${uid}#cfh`,
        image: `https://avator.eastmoney.com/qface/${uid}/360`,
        item: items,
    };
}
