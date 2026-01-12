import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    path: '/lists/:id',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: '栏目',
    example: '/jiemian/lists/65',
    maintainers: ['WenhuWee', 'nczitzk'],
    handler,
    description: `| [首页](https://www.jiemian.com) | [商业](https://www.jiemian.com/lists/2.html) | [财经](https://www.jiemian.com/lists/800.html) | [新闻](https://www.jiemian.com/lists/801.html) | [文化生活](https://www.jiemian.com/lists/130.html) | [快报](https://www.jiemian.com/lists/4.html) |
| ------------------------------- | -------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
|                                 | 2                                            | 800                                            | 801                                            | 130                                                | 4                                            |

::: details 更多分类

#### [首页](https://www.jiemian.com)

| [科技](https://www.jiemian.com/lists/65.html) | [金融](https://www.jiemian.com/lists/9.html) | [证券](https://www.jiemian.com/lists/112.html) | [地产](https://www.jiemian.com/lists/62.html) | [汽车](https://www.jiemian.com/lists/51.html) | [健康](https://www.jiemian.com/lists/472.html) |
| --------------------------------------------- | -------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| 65                                            | 9                                            | 112                                            | 62                                            | 51                                            | 472                                            |

| [大湾区](https://www.jiemian.com/lists/680.html) | [元宇宙](https://www.jiemian.com/lists/704.html) | [文旅](https://www.jiemian.com/lists/105.html) | [数据](https://www.jiemian.com/lists/154.html) | [ESG](https://www.jiemian.com/lists/712.html) | [双碳](https://www.jiemian.com/lists/877.html) |
| ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| 680                                              | 704                                              | 105                                            | 154                                            | 712                                           | 877                                            |

| [电厂](https://www.jiemian.com/lists/872.html) |
| ---------------------------------------------- |
| 872                                            |

#### [商业](https://www.jiemian.com/lists/2.html)

| [科技](https://www.jiemian.com/lists/65.html) | [地产](https://www.jiemian.com/lists/62.html) | [ 汽车](https://www.jiemian.com/lists/51.html) | [消费](https://www.jiemian.com/lists/31.html) | [工业](https://www.jiemian.com/lists/28.html) | [时尚](https://www.jiemian.com/lists/68.html) |
| --------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| 65                                            | 62                                            | 51                                             | 31                                            | 28                                            | 68                                            |

| [交通](https://www.jiemian.com/lists/30.html) | [医药](https://www.jiemian.com/lists/472.html) | [互联网](https://www.jiemian.com/lists/851.html) | [创投 ](https://www.jiemian.com/lists/858.html) | [能源](https://www.jiemian.com/lists/856.html) | [数码](https://www.jiemian.com/lists/853.html) |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 30                                            | 472                                            | 851                                              | 858                                             | 856                                            | 853                                            |

| [教育](https://www.jiemian.com/lists/256.html) | [食品](https://www.jiemian.com/lists/845.html) | [新能源](https://www.jiemian.com/lists/857.html) | [家电](https://www.jiemian.com/lists/850.html) | [健康](https://www.jiemian.com/lists/854.html) | [酒业](https://www.jiemian.com/lists/676.html) |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 256                                            | 845                                            | 857                                              | 850                                            | 854                                            | 676                                            |

| [物流](https://www.jiemian.com/lists/841.html) | [零售](https://www.jiemian.com/lists/847.html) | [美妆](https://www.jiemian.com/lists/838.html) | [楼市](https://www.jiemian.com/city/main/181.html) | [家居](https://www.jiemian.com/lists/694.html) | [餐饮](https://www.jiemian.com/lists/848.html) |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 841                                            | 847                                            | 838                                            | city/main/181                                      | 694                                            | 848                                            |

| [日用](https://www.jiemian.com/lists/846.html) | [企服](https://www.jiemian.com/lists/852.html) | [珠宝](https://www.jiemian.com/lists/839.html) | [腕表](https://www.jiemian.com/lists/840.html) | [ 商学院](https://www.jiemian.com/lists/605.html) | [元宇宙](https://www.jiemian.com/lists/704.html) |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| 846                                            | 852                                            | 839                                            | 840                                            | 605                                               | 704                                              |

| [电厂](https://www.jiemian.com/lists/872.html) | [农业](https://www.jiemian.com/lists/883.html) |
| ---------------------------------------------- | ---------------------------------------------- |
| 872                                            | 883                                            |

#### [财经](https://www.jiemian.com/lists/800.html)

| [金融](https://www.jiemian.com/lists/9.html) | [投资](https://www.jiemian.com/lists/86.html) | [证券](https://www.jiemian.com/lists/112.html) | [IPO](https://www.jiemian.com/lists/699.html) | [宏观](https://www.jiemian.com/lists/174.html) | [股市](https://www.jiemian.com/lists/418.html) |
| -------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 9                                            | 86                                            | 112                                            | 699                                           | 174                                            | 418                                            |

| [财富](https://www.jiemian.com/lists/410.html) | [有连云](https://www.jiemian.com/lists/889.html) |
| ---------------------------------------------- | ------------------------------------------------ |
| 410                                            | 889                                              |

#### [新闻](https://www.jiemian.com/lists/801.html)

| [天下](https://www.jiemian.com/lists/32.html) | [中国](https://www.jiemian.com/lists/71.html) | [ 评论](https://www.jiemian.com/lists/8.html) | [数据](https://www.jiemian.com/lists/154.html) | [职场](https://www.jiemian.com/lists/50.html) | [国是](https://www.jiemian.com/lists/422.html) |
| --------------------------------------------- | --------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| 32                                            | 71                                            | 8                                             | 154                                            | 50                                            | 422                                            |

| [体育](https://www.jiemian.com/lists/82.html) | [文娱](https://www.jiemian.com/lists/63.html) | [ 影像](https://www.jiemian.com/lists/225.html) | [营销](https://www.jiemian.com/lists/49.html) | [大 湾区](https://www.jiemian.com/lists/680.html) | [ESG](https://www.jiemian.com/lists/712.html) |
| --------------------------------------------- | --------------------------------------------- | ----------------------------------------------- | --------------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| 82                                            | 63                                            | 225                                             | 49                                            | 680                                               | 712                                           |

| [双碳](https://www.jiemian.com/lists/877.html) | [长三角](https://www.jiemian.com/lists/917.html) |
| ---------------------------------------------- | ------------------------------------------------ |
| 877                                            | 917                                              |

#### [文化生活](https://www.jiemian.com/lists/130.html)

| [文化](https://www.jiemian.com/lists/130.html) | [文旅](https://www.jiemian.com/lists/105.html) | [生活方式](https://www.jiemian.com/lists/135.html) | [美食美酒](https://www.jiemian.com/lists/865.html) | [艺术](https://www.jiemian.com/lists/643.html) | [游戏](https://www.jiemian.com/lists/118.html) |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 130                                            | 105                                            | 135                                                | 865                                                | 643                                            | 118                                            |

| [正午](https://www.jiemian.com/lists/53.html) | [箭厂](https://www.jiemian.com/video/lists/195_1.html) |
| --------------------------------------------- | ------------------------------------------------------ |
| 53                                            | video/lists/195_1                                     |

#### [快报](https://www.jiemian.com/lists/4.html)

| [今日热点](https://www.jiemian.com/lists/1324kb.html) | [公司头条](https://www.jiemian.com/lists/1322kb.html) | [股市前沿](https://www.jiemian.com/lists/1327kb.html) | [监管通报](https://www.jiemian.com/lists/1330kb.html) | [财经速览](https://www.jiemian.com/lists/1326kb.html) | [时事追踪](https://www.jiemian.com/lists/1325kb.html) |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 1324kb                                                | 1322kb                                                | 1327kb                                                | 1330kb                                                | 1326kb                                                | 1325kb                                                |

:::`,
};
