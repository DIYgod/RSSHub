import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:id',
    categories: ['new-media'],
    example: '/liulinblog/tag/qukuailian',
    parameters: { id: '标签 id，可在对应标签页 URL 中找到，见下表' },
    radar: [
        {
            source: ['liulinblog.com/tag/:id', 'liulinblog.com/'],
            target: '/tag/:id',
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
    description: `| 区块链     | 小红书      | 小说项目 | 微信公众号 | 微信营销 |
| ---------- | ----------- | -------- | ---------- | -------- |
| qukuailian | xiaohongshu | xiaoshuo | 微信公众号 | we-chat  |

| 抖音 | 抖音直播 | 拼多多    | 支付宝 | 教育 |
| ---- | -------- | --------- | ------ | ---- |
| 抖音 | 抖音直播 | pinduoduo | alipay | 教育 |

| chrome 插件 | galgame 汉化游戏 | honeyselect 汉化游戏 | PSD 笔刷素材 | ps 插件    |
| ----------- | ---------------- | -------------------- | ------------ | ---------- |
| chrome 插件 | galgame          | honey-select         | psd-bishua   | ps-chajian |

| vip 视频   | windows 实用技巧 | 下载软件 | 丝袜玉足 | 免费字体下载 |
| ---------- | ---------------- | -------- | -------- | ------------ |
| vip-shipin | computer         | download | siwa     | ziti         |

| 二战游戏下载 | 冒险解谜游戏 | 动作游戏下载 | 安卓游戏     | 策略游戏   |
| ------------ | ------------ | ------------ | ------------ | ---------- |
| war-games    | 冒险解谜游戏 | 动作游戏下载 | android-game | game-celve |

| Pr 插件 | Python | seo 优化 | VLOG | wordpress | word 技巧 |
| ------- | ------ | -------- | ---- | --------- | --------- |
| pr 插件 | python | seo      | vlog | wordpress | word      |`,
};
