import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'BNU-HKBU United International College',
    url: 'uic.edu.cn',
    description: `
:::tip
这b学校的网站证书有问题（证书链不完整）导致 Linux 下的部分软件 curl / nodejs fetch / python requests 等无法验证其证书。

[myssl.com](https://myssl.com/uic.edu.cn?domain=uic.edu.cn&status=q)

需要设置 [NODE_TLS_REJECT_UNAUTHORIZED = '0'](https://github.com/DIYgod/RSSHub/commit/741a3b8a8e0e2fa8f347a0443e417170ebf54e06) 环境变量
:::
    `,
    zh: {
        name: '北京师范大学-香港浸会大学联合国际学院',
    },
};
