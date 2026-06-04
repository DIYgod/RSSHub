import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'South Plus',
    url: 'south-plus.net',
    description: `::: tip
South Plus (南 +) 是一个基于 PHPWind 架构的 ACG 综合交流论坛。

部分板块需要登录才能访问，请配置 \`SOUTHPLUS_COOKIE\` 环境变量。

**获取 Cookie 步骤：**

1. 在浏览器中登录 [snow-plus.net](https://snow-plus.net) 或 [south-plus.net](https://south-plus.net)
2. 确认右上角显示用户名和「退出」链接（而非「登录」）
3. 按 F12 → Application/Storage → Cookies → 选择站点域名
4. 将所有 cookie 拼接为单行：\`key1=value1; key2=value2; ...\`
5. 核心 cookie 为 \`eb9e6_winduser\`（认证令牌）和 \`eb9e6_cknum\`（会话校验）

:::`,
    lang: 'zh-CN',
};
