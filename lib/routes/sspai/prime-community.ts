import { config } from '@/config';
import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/prime/community',
    categories: ['new-media'],
    example: '/sspai/prime/community',
    features: {
        requireConfig: [
            {
                name: 'SSPAI_BEARERTOKEN',
                optional: false,
                description: `少数派会员账号认证 token。获取方式：登陆后打开少数派会员社区界面，打开浏览器开发者工具中 “网络”(Network) 选项卡，筛选 URL 找到任一个地址为 \`sspai.com/api\` 开头的请求，点击检查其 “消息头”，在 “请求头” 中找到Authorization字段，将其值复制填入配置即可。你的配置应该形如 \`SSPAI_BEARERTOKEN: 'Bearer eyJxxxx......xx_U8'\`。`,
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
            source: ['sspai.com/community'],
        },
    ],
    name: '会员社区',
    maintainers: ['mintyfrankie'],
    handler,
};

const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyNzU3NiIsInR5cGUiOiJ1c2VyIiwiZXhwIjoxNzQ4NTI2MDEzfQ.di8RB-lxHI_JMBQHFd2xhcpk6Zd_3bvfQlAti6HAuZA';

async function handler() {
    let token;
    const cacheIn = await cache.get('sspai:token');

    if (cacheIn) {
        token = cacheIn;
    } else if (config.sspai.bearertoken) {
        token = config.sspai.bearertoken;
        cache.set('sspai:token', config.sspai.bearertoken);
    } else {
        token = TOKEN;
    }

    const feedEndpoint = 'https://sspai.com/api/v1/community/page/get';
    const headers = {
        Authorization: token,
    };

    const response = await ofetch(feedEndpoint, { headers });
    const list = response.data.map((item) => ({
        title: item.title,
        link: `https://sspai.com/t/${item.id_hash}`,
        pubDate: new Date(item.created_at * 1000),
        author: item.author.nickname,
        category: item.channel.title,
        id_hash: item.id_hash,
    }));

    // FIXME: TypeError: Cannot read properties of null (reading 'body')
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const postEndpoint = `https://sspai.com/api/v1/community/topic/single/info/get?id_hash=${item.id_hash}`;
                const response = await ofetch(postEndpoint, { headers });
                item.description = response.data.body || 'No content';
                return item;
            })
        )
    );

    return {
        title: '少数派会员社区',
        link: 'https://sspai.com/community',
        lang: 'zh-CN',
        description: '少数派会员社区',
        item: items,
    };
}
