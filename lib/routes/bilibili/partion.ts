import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/partion/:tid/:disableEmbed?',
    categories: ['social-media'],
    example: '/bilibili/partion/33',
    parameters: { tid: '分区 id', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分区视频',
    maintainers: ['DIYgod'],
    handler,
    description: `动画

  | MAD·AMV | MMD·3D | 短片・手书・配音 | 特摄 | 综合 |
  | ------- | ------ | ---------------- | ---- | ---- |
  | 24      | 25     | 47               | 86   | 27   |

  番剧

  | 连载动画 | 完结动画 | 资讯 | 官方延伸 |
  | -------- | -------- | ---- | -------- |
  | 33       | 32       | 51   | 152      |

  国创

  | 国产动画 | 国产原创相关 | 布袋戏 | 动态漫・广播剧 | 资讯 |
  | -------- | ------------ | ------ | -------------- | ---- |
  | 153      | 168          | 169    | 195            | 170  |

  音乐

  | 原创音乐 | 翻唱 | VOCALOID·UTAU | 电音 | 演奏 | MV  | 音乐现场 | 音乐综合 | ~~OP/ED/OST~~ |
  | -------- | ---- | ------------- | ---- | ---- | --- | -------- | -------- | ------------- |
  | 28       | 31   | 30            | 194  | 59   | 193 | 29       | 130      | 54            |

  舞蹈

  | 宅舞 | 街舞 | 明星舞蹈 | 中国舞 | 舞蹈综合 | 舞蹈教程 |
  | ---- | ---- | -------- | ------ | -------- | -------- |
  | 20   | 198  | 199      | 200    | 154      | 156      |

  游戏

  | 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV | 音游 | Mugen |
  | -------- | -------- | -------- | -------- | -------- | --- | ---- | ----- |
  | 17       | 171      | 172      | 65       | 173      | 121 | 136  | 19    |

  知识

  | 科学科普 | 社科人文 | 财经 | 校园学习 | 职业职场 | 野生技术协会 |
  | -------- | -------- | ---- | -------- | -------- | ------------ |
  | 201      | 124      | 207  | 208      | 209      | 122          |

  ~~科技~~

  | ~~演讲・公开课~~ | ~~星海~~ | ~~机械~~ | ~~汽车~~ |
  | ---------------- | -------- | -------- | -------- |
  | 39               | 96       | 98       | 176      |

  数码

  | 手机平板 | 电脑装机 | 摄影摄像 | 影音智能 |
  | -------- | -------- | -------- | -------- |
  | 95       | 189      | 190      | 191      |

  生活

  | 搞笑 | 日常 | 美食圈 | 动物圈 | 手工 | 绘画 | 运动 | 汽车 | 其他 | ~~ASMR~~ |
  | ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | -------- |
  | 138  | 21   | 76     | 75     | 161  | 162  | 163  | 176  | 174  | 175      |

  鬼畜

  | 鬼畜调教 | 音 MAD | 人力 VOCALOID | 教程演示 |
  | -------- | ------ | ------------- | -------- |
  | 22       | 26     | 126           | 127      |

  时尚

  | 美妆 | 服饰 | 健身 | T 台 | 风向标 |
  | ---- | ---- | ---- | ---- | ------ |
  | 157  | 158  | 164  | 159  | 192    |

  ~~广告~~

  | ~~广告~~ |
  | -------- |
  | 166      |

  资讯

  | 热点 | 环球 | 社会 | 综合 |
  | ---- | ---- | ---- | ---- |
  | 203  | 204  | 205  | 206  |

  娱乐

  | 综艺 | 明星 | Korea 相关 |
  | ---- | ---- | ---------- |
  | 71   | 137  | 131        |

  影视

  | 影视杂谈 | 影视剪辑 | 短片 | 预告・资讯 |
  | -------- | -------- | ---- | ---------- |
  | 182      | 183      | 85   | 184        |

  纪录片

  | 全部 | 人文・历史 | 科学・探索・自然 | 军事 | 社会・美食・旅行 |
  | ---- | ---------- | ---------------- | ---- | ---------------- |
  | 177  | 37         | 178              | 179  | 180              |

  电影

  | 全部 | 华语电影 | 欧美电影 | 日本电影 | 其他国家 |
  | ---- | -------- | -------- | -------- | -------- |
  | 23   | 147      | 145      | 146      | 83       |

  电视剧

  | 全部 | 国产剧 | 海外剧 |
  | ---- | ------ | ------ |
  | 11   | 185    | 187    |`,
};

async function handler(ctx) {
    const tid = ctx.req.param('tid');
    const disableEmbed = ctx.req.param('disableEmbed');

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${Date.now()}`,
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });

    const list = response.data.data.archives;
    let name = '未知';
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    return {
        title: `bilibili ${name}分区`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区`,
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                description: `${item.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    };
}
