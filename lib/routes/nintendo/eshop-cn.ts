import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';
const software_url = 'https://www.nintendoswitch.com.cn/software/';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/eshop/cn',
    radar: [
        {
            source: ['nintendoswitch.com.cn/software', 'nintendoswitch.com.cn/'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'nintendoswitch.com.cn/software',
};

async function handler() {
    const response = await got(software_url);

    // 获取Nuxt对象
    const result = await util.nuxtReader(response.data);

    /* expectedReleaseNS[]
        coverImageUrl: "//switch-cn.gtgres.com/global-images/c50e3390-14e5-11ea-9b40-236e671bca9e.png"
        expectedReleaseDate: 0
        expectedReleaseDateFuzzy: ""
        gameName: "Mario Tennis Aces"
        id: 1852
        newsPageUrl: ""
      recentSoftwareList[]
        imgUrl: "https://metadata-images.nintendoswitch.com.cn/formal/8332803007012-1F2B121D-743F-B868-5595-35C79BB2A817-KV.jpg"
        jumpUrl: "https://www.nintendoswitch.com.cn/awuxa/index.html"
        publishTime: "2022.10.31"
        title: "附带导航！一做就上手 第一次的游戏程序设计"
    */
    if (!result.recentSoftwareList) {
        throw new InvalidParameterError('软件信息不存在，请报告这个问题');
    }

    let data = result.recentSoftwareList.map((item) => ({
        title: item.title,
        description: util.generateImageLink(item.imgUrl),
        link: item.jumpUrl.startsWith('http') ? item.jumpUrl : `${software_url}${item.jumpUrl}`,
        pubDate: parseDate(item.publishTime, 'YYYY.MM.DD'),
    }));

    data = await util.ProcessItemChina(data, cache);

    return {
        title: 'Nintendo eShop（国服）新游戏',
        link: 'https://www.nintendoswitch.com.cn/software',
        description: 'Nintendo（国服）新上架的游戏',
        item: data,
    };
}
