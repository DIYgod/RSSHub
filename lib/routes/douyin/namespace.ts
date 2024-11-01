import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '抖音直播',
    url: 'douyin.com',
    description: `:::warning
反爬严格，需要启用 puppeteer。\
抖音的视频 CDN 会验证 Referer，意味着许多阅读器都无法直接播放内嵌视频，以下是一些变通解决方案：

1.  启用内嵌视频 (\`embed=1\`), 参考 [通用参数 -> 多媒体处理](/parameter#多媒体处理) 配置 \`multimedia_hotlink_template\` **或** \`wrap_multimedia_in_iframe\`。
2.  关闭内嵌视频 (\`embed=0\`)，手动点击 \`视频直链\` 超链接，一般情况下均可成功播放视频。若仍然出现 HTTP 403，请复制 URL 以后到浏览器打开。
3.  点击原文链接打开抖音网页版的视频详情页播放视频。
:::

额外参数

| 键      | 含义             | 值                     | 默认值  |
| ------- | ---------------- | ---------------------- | ------- |
| \`embed\` | 是否启用内嵌视频 | \`0\`/\`1\`/\`true\`/\`false\` | \`false\` |`,
    lang: 'zh-CN',
};
