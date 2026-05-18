import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '微博',
    url: 'weibo.com',
    description: `::: warning
微博会针对请求的来源地区返回不同的结果。一个已知的例子为：部分视频因未知原因仅限中国大陆境内访问 (CDN 域名为 \`locallimit.us.sinaimg.cn\` 而非 \`f.video.weibocdn.com\`)。若一条微博含有这种视频且 RSSHub 实例部署在境外，抓取到的微博可能不含视频。将 RSSHub 部署在境内有助于抓取这种视频，但阅读器也必须处于境内网络环境以加载视频。
:::

::: warning
大部分路由均需要 Cookies 才能获取。优先使用 \`WEIBO_COOKIES\`；未设置时尝试使用 Puppeteer 获取访客 Cookies。部分路由不支持访客访问，则必须设置 \`WEIBO_COOKIES\`，详见各个路由的文档。
:::

对于微博内容，在 \`routeParams\` 参数中以 query string 格式指定选项，可以控制输出的样式

| 键                         | 含义                                                               | 接受的值       | 默认值                              |
| -------------------------- | ------------------------------------------------------------------ | -------------- | ----------------------------------- |
| readable                   | 是否开启细节排版可读性优化                                         | 0/1/true/false | false                               |
| authorNameBold             | 是否加粗作者名字                                                   | 0/1/true/false | false                               |
| showAuthorInTitle          | 是否在标题处显示作者                                               | 0/1/true/false | false（\`/weibo/keyword/\`中为 true） |
| showAuthorInDesc           | 是否在正文处显示作者                                               | 0/1/true/false | false（\`/weibo/keyword/\`中为 true） |
| showAuthorAvatarInDesc     | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启）     | 0/1/true/false | false                               |
| showEmojiForRetweet        | 显示 “🔁” 取代 “转发” 两个字                                       | 0/1/true/false | false                               |
| showRetweetTextInTitle     | 在标题出显示转发评论（置为 false 则在标题只显示被转发微博）        | 0/1/true/false | true                                |
| addLinkForPics             | 为图片添加可点击的链接                                             | 0/1/true/false | false                               |
| showTimestampInDescription | 在正文处显示被转发微博的时间戳                                     | 0/1/true/false | false                               |
| widthOfPics                | 微博配图宽（生效取决于阅读器）                                     | 不指定 / 数字  | 不指定                              |
| heightOfPics               | 微博配图高（生效取决于阅读器）                                     | 不指定 / 数字  | 不指定                              |
| sizeOfAuthorAvatar         | 作者头像大小                                                       | 数字           | 48                                  |
| displayVideo               | 是否直接显示微博视频和 Live Photo，只在博主或个人时间线 RSS 中有效 | 0/1/true/false | true                                |
| displayArticle             | 是否直接显示微博文章，只在博主或个人时间线 RSS 中有效              | 0/1/true/false | false                               |
| displayComments            | 是否直接显示热门评论，只在博主或个人时间线 RSS 中有效              | 0/1/true/false | false                               |
| showEmojiInDescription     | 是否展示正文和评论中的微博表情，关闭则替换为 \`[表情名]\`            | 0/1/true/false | true                                |
| showLinkIconInDescription  | 是否展示正文和评论中的链接图标                                     | 0/1/true/false | true                                |
| preferMobileLink           | 是否使用移动版链接（默认使用 PC 版）                               | 0/1/true/false | false                               |
| showRetweeted              | 是否显示转发的微博                                                 | 0/1/true/false | true                                |
| showBloggerIcons           | 是否显示评论中博主的标志，只在显示热门评论时有效                   | 0/1/true/false | false                               |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

<https://rsshub.app/weibo/user/1642909335/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showTimestampInDescription=1&heightOfPics=150>

的效果为

<img loading="lazy" src="/img/readable-weibo.png" alt="微博小秘书的可读微博 RSS" />`,
    lang: 'zh-CN',
};
