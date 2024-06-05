import { Route } from '@/types';
import { processFeed } from './utils';

const handler = (ctx) => processFeed('follow', ctx);

export const route: Route = {
    path: '/follow/articles/:language?',
    name: '个人订阅追踪动态',
    maintainers: ['AgFlore'],
    parameters: {
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体',
    },
    radar: [
        {
            title: '作者',
            source: ['theinitium.com/author/:type'],
            target: '/author/:type',
        },
    ],
    handler,
    example: '/theinitium/author/ninghuilulu/zh-hans',
    categories: ['new-media'],
    description: '需填入 Web 版认证 token, 也可选择直接在环境设置中填写明文的用户名和密码',
    features: {
        requireConfig: [
            {
                name: 'INITIUM_BEARER_TOKEN',
                optional: true,
                description: `端传媒 Web 版认证 token。获取方式：登陆后打开端传媒站内任意页面，打开浏览器开发者工具中 “网络”(Network) 选项卡，筛选 URL 找到任一个地址为 \`api.initium.com\` 开头的请求，点击检查其 “消息头”，在 “请求头” 中找到Authorization字段，将其值复制填入配置即可。你的配置应该形如 \`INITIUM_BEARER_TOKEN: 'Bearer eyJxxxx......xx_U8'\`。使用 token 部署的好处是避免占据登陆设备数的额度，但这个 token 一般有效期为两周，因此只可作临时测试使用。`,
            },
            {
                name: 'INITIUM_USERNAME',
                optional: true,
                description: `端传媒用户名 （邮箱）`,
            },
            {
                name: 'INITIUM_PASSWORD',
                optional: true,
                description: `端传媒密码`,
            },
        ],
    },
};
