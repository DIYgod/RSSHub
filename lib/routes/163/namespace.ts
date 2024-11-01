import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '网易公开课',
    url: '163.com',
    description: `:::tip
部分歌单及听歌排行信息为登陆后可见，自建时将环境变量\`NCM_COOKIES\`设为登陆后的 Cookie 值，即可正常获取。
:::`,
    lang: 'zh-CN',
};
