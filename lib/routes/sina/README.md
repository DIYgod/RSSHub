## 新浪路由抓取方法总览

本文档总结本项目内与新浪相关的路由实现、数据来源与提取差异，便于维护与扩展。

### 范围

- `sina/rollnews` 滚动新闻（含多频道）
- `sina/discovery` 科技-科学探索（多分类）
- `sina/finance/china` 财经-国内（多频道）
- `sina/sports` 体育（多分类）
- `sina/zhibo` 7x24 财经直播

### 抓取来源与核心流程

- 滚动/频道类（rollnews、discovery、finance/china、sports）

    1. 列表页：请求滚动接口 `https://feed.mix.sina.com.cn/api/roll/get`（或抓静态频道页）获取条目列表。
    2. 详情页：逐条请求文章详情页 HTML，使用 `cheerio` 抽取正文与元信息（作者/时间/关键词）。
    3. 多媒体特殊处理：
        - 幻灯页（`slide.sports.sina.com.cn` / `slide.tech.sina.com.cn`）：解析内联 `slide_data`，用模板 `templates/slide.art` 渲染图片列表。
        - 视频页（`video.sina.com.cn`）：调用 `https://api.ivideo.sina.com.cn/public/video/play` 获取海报与 MP4，使用模板 `templates/video.art` 嵌入。
        - 常规新闻页：优先 `#article`，否则 `#artibody`。

- 7x24 财经直播（`sina/zhibo`）
    1. 列表页：请求 `https://zhibo.sina.com.cn/api/zhibo/feed` 获取直播流，核心字段为 `rich_text`（可能含 HTML 片段）。
    2. 条目链接：为每条构造 7x24 单条详情链接 `https://finance.sina.com.cn/7x24/sina-finance-zhibo-<id>`，便于查看上下文（总页见 [`https://finance.sina.com.cn/7x24/`](https://finance.sina.com.cn/7x24/)）。
    3. 图片补充（“一图看懂”）：若 `rich_text` 不含图片但文本包含“一图看懂”，则抓取详情页并解析 `og:image`/`twitter:image`，将图片以 `<img>` 附加到 `description`。为兼容显式防盗链，图片标签带 `referrerpolicy="no-referrer"`。

### 路由与实现文件

- `sina/rollnews` → `lib/routes/sina/rollnews.ts`

    - 列表/详情工具：`lib/routes/sina/utils.ts` 中的 `getRollNewsList`、`parseRollNewsList`、`parseArticle`
    - 多媒体模板：`lib/routes/sina/templates/slide.art`、`lib/routes/sina/templates/video.art`

- `sina/discovery` → `lib/routes/sina/discovery.ts`（复用 `utils.ts`）
- `sina/finance/china` → `lib/routes/sina/finance/china.ts`（复用 `utils.ts`）
- `sina/sports` → `lib/routes/sina/sports.ts`（频道页抓取 + 详情复用 `utils.ts`）
- `sina/zhibo` → `lib/routes/sina/finance/zhibo.ts`

### 统一抓取方法的差异点

| 维度      | 滚动/频道类（rollnews/discovery/finance/sports）             | 7x24 财经直播（zhibo）                                                     |
| --------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 列表来源  | `feed.mix.sina.com.cn/api/roll/get` 或频道页 DOM             | `zhibo.sina.com.cn/api/zhibo/feed`                                         |
| 条目标题  | 列表字段 `title`                                             | 由 `rich_text` 去标签截取（80 字内）                                       |
| 条目链接  | 列表字段 `url`（https 替换）                                 | 构造 `https://finance.sina.com.cn/7x24/sina-finance-zhibo-<id>`            |
| 内容抽取  | 访问详情页，按类型分支：幻灯/视频/常规正文                   | 直接使用 `rich_text`；必要时访问详情页补图                                 |
| 图片策略  | 幻灯解析 `slide_data`；常规正文内 `<img>` 原样；视频模板嵌入 | 优先 `rich_text` 自带 `<img>`；“一图看懂”额外抓 `og:image`/`twitter:image` |
| 反盗链    | 详情页图片通常同源可直接显示                                 | 追加图片使用 `referrerpolicy="no-referrer"` 降低防盗链风险                 |
| 依赖      | `cheerio`、`art` 模板、`got`                                 | `got`、`cheerio`（仅在补图时用）                                           |
| Puppeteer | 不需要                                                       | 不需要                                                                     |

### 参数与示例

- `GET /sina/rollnews/:lid?`（默认 `lid=2509` 全部）
- `GET /sina/discovery/:type`（如 `zx`/`twhk`/…）
- `GET /sina/finance/china/:lid?`（如 `1686` 国内滚动）
- `GET /sina/sports/:type?`（如 `ufc`/`winter`/`horse`）
- `GET /sina/zhibo/:zhibo_id?`（默认 `152` 财经）
    - 额外查询参数：`limit`（默认 20）、`pagesize`（1-10，默认 10）、`tag`（默认 0）、`dire`（`f`/`b`，默认 `f`）、`dpc`（默认 `1`）

### 已知边界

- 7x24 详情页若无 `og:image` 且页面完全依赖动态渲染，可能无法补图（不影响文本）。
- 新浪若调整 7x24 单条链接格式（`sina-finance-zhibo-<id>`），需同步更新。
- 个别频道正文结构差异较大（如专题页），可能需要按频道扩展解析逻辑。

### 参考

- 7x24 列表页：[`https://finance.sina.com.cn/7x24/`](https://finance.sina.com.cn/7x24/)
- 在线预览示例（财经直播）：[`https://rss-hub-topaz-ten.vercel.app/sina/zhibo`](https://rss-hub-topaz-ten.vercel.app/sina/zhibo)

### 变更记录（摘）

- 2025-08-11：`sina/zhibo` 补充条目详情链接，并为包含“一图看懂”的条目抓取详情页 `og:image`/`twitter:image` 以追加展示。
