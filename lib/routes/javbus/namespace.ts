import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'JavBus',
    url: 'www.javbus.com',
    description: `::: warning
Requests from non-Asia areas will be redirected to login page.
:::

::: tip Language
You can change the language of each route to the languages listed below.

| English | 日本语 | 한국의 | 中文             |
| ------- | ------ | ------ | ---------------- |
| en      | ja     | ko     | (leave it empty) |
:::

::: tip
JavBus has multiple backup domains, these routes use default domain \`https://javbus.com\`. If the domain is unreachable, you can add \`?domain=<domain>\` to the end of the route to specify the domain to visit. Let say you want to use the backup domain \`https://javsee.icu\`, you can add \`?domain=javsee.icu\` to the end of the route, then the route will be [\`/javbus/en?domain=javsee.icu\`](https://rsshub.app/javbus?domain=javsee.icu)

**Note**: **Western** has different domain than the main site, the backup domains are also different. The default domain is \`https://javbus.org\` and you can add \`?western_domain=<domain>\` to the end of the route to specify the domain to visit. Let say you want to use the backup domain \`https://javsee.one\`, you can add \`?western_domain=javsee.one\` to the end of the route, then the route will be [\`/javbus/western/en?western_domain=javsee.one\`](https://rsshub.app/javbus/western?western_domain=javsee.one)
:::`,
    lang: 'en',
};
