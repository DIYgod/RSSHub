import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '南京信息工程大学',
    url: 'bulletin.nuist.edu.cn',
    description: `::: tip
路由地址全部按照 **学校官网域名和栏目编号** 设计

使用方法：

以[南信大信息公告栏](https://bulletin.nuist.edu.cn)为例，点开任意一个栏目

获得 URL 中的**分域名**和**栏目编号（可选）**：https://\`bulletin\`.nuist.edu.cn/\`791\`/list.htm

将其替换到 RSS 路由地址中即可：

[https://rsshub.app/**nuist**/\`bulletin\`](https://rsshub.app/nuist/bulletin) 或 [https://rsshub.app/**nuist**/\`bulletin\`/\`791\`](https://rsshub.app/nuist/bulletin)
:::`,
    lang: 'zh-CN',
};
