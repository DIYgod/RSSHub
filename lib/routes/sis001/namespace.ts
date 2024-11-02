import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '第一会所',
    url: 'sis001.com',
    description: `::: tip
    第一会所有多个备用网址，本路由默认使用\`https://sis001.com\`，若该网址无法访问，可以在部署实例的时候通过\`SIS001_BASE_URL\`环境变量配置要使用的地址，如\`https://www.sis001.com\`等
:::`,
    lang: 'zh-CN',
};
