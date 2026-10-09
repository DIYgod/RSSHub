import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'South Plus',
    url: 'south-plus.net',
    description: `::: tip
South Plus (南 +) 是一个基于 PHPWind 架构的 ACG 综合交流论坛。

部分板块需要登录才能访问，请配置 \`SOUTHPLUS_COOKIE\` 环境变量。

**获取 Cookie 和 User-Agent 步骤：**

1. 在浏览器中登录 [south-plus.net](https://south-plus.net) 或 [snow-plus.net](https://snow-plus.net)
2. 确认右上角显示用户名和「退出」链接（而非「登录」）
3. 按 F12 → **Network**（网络）→ 刷新页面 → 点击任意请求 → **Request Headers**（请求头）
4. 复制 \`Cookie\` 字段的完整值（单行，分号 + 空格分隔），设置为 \`SOUTHPLUS_COOKIE\`
5. 复制 \`User-Agent\` 字段的值，设置为 \`SOUTHPLUS_UA\`（Cookie 与 UA 版本绑定，必须匹配）
6. 如果 Cookie 是通过代理获取的，需设置 RSSHub 全局环境变量 \`PROXY_URI\`（如 \`http://host:port\`）

:::`,
    lang: 'zh-CN',
};
