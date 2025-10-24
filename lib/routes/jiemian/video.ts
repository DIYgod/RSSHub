import { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    path: '/video/lists/258_1',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: '视频',
    example: '/jiemian/video/lists/258_1',
    maintainers: ['nczitzk'],
    handler,
    description: `| [界面 Vnews](https://www.jiemian.com/video/lists/258_1.html) | [直播](https://www.jiemian.com/videoLive/lists_1.html) | [箭厂](https://www.jiemian.com/video/lists/195_1.html) | [面谈](https://www.jiemian.com/video/lists/111_1.html) | [品牌创酷](https://www.jiemian.com/video/lists/226_1.html) | [番 茄社](https://www.jiemian.com/video/lists/567_1.html) |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| 258\_1                                                       | videoLive/lists\_1                                     | 195\_1                                                 | 111\_1                                                 | 226\_1                                                     | 567\_1                                                    |

| [商业微史记](https://www.jiemian.com/video/lists/882_1.html) |
| ------------------------------------------------------------ |
| 882\_1                                                       |`,
};
