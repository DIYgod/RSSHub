import { load } from "cheerio";
import { ofetch } from "ofetch";
import Parser from "@postlight/parser";
import pMap from "p-map";
import sanitizeHtml from "sanitize-html";

import cache from "@/utils/cache";
import logger from "@/utils/logger";
import { parseDate } from "@/utils/parse-date";
import { getPuppeteerPage } from "@/utils/puppeteer";
import type { Data } from "@/types";

interface ArticleItem {
  title: string;
  link: string;
  pubDate: string;
}

interface FetchOptions {
  categoryPath: string;
  categoryName: string;
  categoryLabel: string;
}




/**
 * 通用的税屋网栏目抓取函数
 * @param options 栏目配置选项
 * @returns RSS Feed 数据
 */
export async function fetchShui5cnCategory(options: FetchOptions): Promise<Data> {
  const baseUrl = "https://www.shui5.cn";
  const listUrl = `${baseUrl}/article/${options.categoryPath}/`;

  // 1. 使用优化的 Puppeteer 配置获取列表页并通过 WAF
  const { page: listPage, destory: destoryList } = await getPuppeteerPage(
    listUrl,
    {
      onBeforeLoad: async (page) => {
        // 优化：只拦截真正需要的资源
        await page.setRequestInterception(true);
        page.on("request", (request) => {
          const resourceType = request.resourceType();
          // 只加载必要资源：document（页面）, script（JS验证）
          if (["document", "script"].includes(resourceType)) {
            request.continue();
          } else {
            // 拦截图片、样式、字体等不必要资源
            request.abort();
          }
        });
      },
      gotoConfig: {
        waitUntil: "networkidle2", // 等待 WAF 跳转完成
      },
    },
  );

  let articleList: ArticleItem[] = [];
  let cookieHeader = "";
  let ua = "";

  try {
    // 获取 Cookie 和 UA 供后续使用
    const cookies = await listPage.cookies();
    cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    ua = await listPage.evaluate(() => navigator.userAgent);

    // 提取列表（优化：精确定位到文章列表容器）
    articleList = await listPage.evaluate((baseUrl) => {
      const articles: ArticleItem[] = [];

      // 精确定位到文章列表容器
      const container = document.querySelector("div.left2c");
      if (!container) {
        return articles;
      }

      // 获取所有文章块
      const articleBlocks = container.querySelectorAll(".xwt2");

      for (const block of articleBlocks) {
        // 从 .xwt2_a > a 提取标题和链接
        const linkElem = block.querySelector(".xwt2_a > a");
        if (!linkElem) {
          continue;
        }

        const href = linkElem.getAttribute("href");
        const title = linkElem.textContent?.trim() || "";

        // 从 .xwt2_d .p3 提取日期
        let pubDate = "";
        const dateElem = block.querySelector(".xwt2_d .p3");
        if (dateElem) {
          pubDate = dateElem.textContent?.trim() || "";
        }

        // 构建完整URL
        const fullUrl = href?.startsWith("http") ? href : baseUrl + href;

        if (title && fullUrl) {
          articles.push({
            title,
            link: fullUrl,
            pubDate,
          });
        }

        // 限制数量，避免过多请求
        if (articles.length >= 30) {
          break;
        }
      }
      return articles;
    }, baseUrl);
  } catch (error) {
    logger.error(`List page error for ${options.categoryName}: ${error}`);
    throw error;
  } finally {
    // 关键：获取完列表和 Cookie 后立即关闭浏览器，释放资源
    await destoryList();
  }

  logger.info(
    `Found ${articleList.length} articles in ${options.categoryName}`,
  );

  // 2. 并发获取详情（使用 HTTP 请求，复用 Cookie）
  const items = await pMap(
    articleList,
    (item) =>
      cache.tryGet(item.link, async () => {
        try {
          // 使用从 Puppeteer 获取的 Cookie 和 UA
          const response = await ofetch(item.link, {
            headers: {
              Cookie: cookieHeader,
              "User-Agent": ua,
              Referer: listUrl,
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            },
            timeout: 15000, // 15秒超时
          });

          const $ = load(response);

          // 使用 @postlight/parser 提取纯净正文
          let content = "";
          let author = "税屋网";

          // Manual extraction for shui5.cn specific structure (Primary Method)
          const articleTitle = $(".articleTitle").html() || "";
          const articleResource = $(".articleResource").html() || "";
          const articleDes = $(".articleDes").html() || "";
          const articleContent = $("#tupain").html() || "";

          // Check if we got the main content
          if (articleContent) {
            // Combine sections into structured HTML
            content = `
              ${articleTitle ? `<div class="article-header"><h1>${articleTitle}</h1></div>` : ""}
              ${articleResource ? `<div class="article-meta">${articleResource}</div>` : ""}
              ${articleDes ? `<div class="article-summary">${articleDes}</div>` : ""}
              <div class="article-body">${articleContent}</div>
            `;

            // Apply sanitization to preserve tables and structure
            content = sanitizeHtml(content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img",
                "figure",
                "figcaption",
                "table",
                "tbody",
                "tr",
                "td",
                "th",
                "thead",
              ]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt", "title", "width", "height"],
                a: ["href", "title", "target"],
                div: ["class"],
                table: ["width"],
                td: ["width"],
              },
              allowedClasses: {
                div: [
                  "article-header",
                  "article-meta",
                  "article-summary",
                  "article-body",
                  "arcContent",
                ],
              },
              exclusiveFilter: (frame) => {
                if (frame.tag === "a") {
                  const text = frame.text || "";
                  if (
                    text.includes("税屋") ||
                    text.includes("返回首页") ||
                    text.includes("相关阅读") ||
                    text.includes("点赞") ||
                    text.includes("税层") ||
                    text.includes("财商资讯") ||
                    text.includes("重组税收")
                  ) {
                    return true;
                  }
                }
                return false;
              },
            });

            // Parse author and date from articleResource
            if (articleResource) {
              const resourceText = $(".articleResource").text();
              // Extract date (e.g., "2026年1月12日" or "2026-01-12")
              const dateMatch = resourceText.match(
                /(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})[日]?/,
              );
              if (dateMatch) {
                const year = dateMatch[1];
                const month = dateMatch[2].padStart(2, "0");
                const day = dateMatch[3].padStart(2, "0");
                item.pubDate = `${year}-${month}-${day}`;
              }

              // Extract author info (e.g., "作者：国家税务总局")
              const authorMatch = resourceText.match(
                /作者[：:]\s*(.+?)(?:\s|$)/,
              );
              if (authorMatch) {
                author = authorMatch[1].trim();
              }
            }
          }

          // Fallback: try @postlight/parser if manual extraction failed
          if (!content || content.length < 100) {
            try {
              const parsed = await Parser.parse(item.link, {
                html: response,
              });
              if (parsed) {
                content = parsed.content || "";
                author = parsed.author || "税屋网";

                // 使用 sanitize-html 进一步清理内容
                if (content) {
                  // 先用 cheerio 移除不必要的包装元素
                  const $clean = load(content);

                  // 移除可能残留的表格包装，只保留内容
                  if (
                    $clean("td").length === 1 &&
                    $clean("table").length === 0
                  ) {
                    content = $clean("td").html() || content;
                  }

                  content = sanitizeHtml(content, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                      "img",
                      "figure",
                      "figcaption",
                    ]),
                    allowedAttributes: {
                      ...sanitizeHtml.defaults.allowedAttributes,
                      img: ["src", "alt", "title", "width", "height"],
                      a: ["href", "title"],
                    },
                    // 排除特定文本内容
                    exclusiveFilter: (frame) => {
                      // 移除包含特定文本的链接
                      if (frame.tag === "a") {
                        const text = frame.text || "";
                        if (
                          text.includes("税屋") ||
                          text.includes("返回首页") ||
                          text.includes("相关阅读") ||
                          text.includes("点赞") ||
                          text.includes("税层")
                        ) {
                          return true;
                        }
                      }
                      return false;
                    },
                  });
                }
              }
            } catch (parserError) {
              logger.warn(
                `Parser failed for ${item.link}, fallback to manual extraction`,
              );
            }
          }

          // 如果 parser 失败或内容太短，回退到原有的手工提取方式
          if (!content || content.length < 100) {
            content = $(
              ".article-content, .detail-content, .content, #content, article, .post-content",
            )
              .first()
              .html();

            // 如果没找到内容，尝试移除导航和侧边栏后获取 body
            if (!content) {
              $("nav, header, footer, .sidebar, .nav, .menu").remove();
              content = $("body").html();
            }

            // 手工提取的内容也需要清理
            if (content) {
              content = sanitizeHtml(content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  "img",
                  "figure",
                  "figcaption",
                ]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ["src", "alt", "title", "width", "height"],
                  a: ["href", "title"],
                },
              });
            }
          }

          // 尝试提取更精确的日期
          let pubDate = item.pubDate;
          if (!pubDate) {
            // 优化：支持中文日期格式
            const dateSelectors = [
              ".date",
              ".publish-time",
              "time",
              ".post-date",
              ".article-date",
              ".time",
            ];
            for (const selector of dateSelectors) {
              const dateText = $(selector).text();
              const match = dateText?.match(
                /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?/,
              );
              if (match) {
                pubDate = match[0].replaceAll(/[年月日]/g, (m) =>
                  m === "年" ? "-" : m === "月" ? "-" : "",
                );
                break;
              }
            }
          }

          return {
            title: item.title,
            link: item.link,
            description: content || "无法获取文章内容",
            pubDate: pubDate ? parseDate(pubDate) : new Date(),
            author: author,
            category: ["财税", options.categoryLabel],
          };
        } catch (error) {
          logger.error(`Error fetching article ${item.link}: ${error}`);
          return {
            title: item.title,
            link: item.link,
            description: `获取文章内容失败: ${error}`,
            pubDate: item.pubDate ? parseDate(item.pubDate) : new Date(),
            author: "税屋网",
          };
        }
      }),
    { concurrency: 5 }, // 并发数：5个请求同时进行
  );

  return {
    title: `税屋网 - ${options.categoryName}`,
    link: listUrl,
    description: `税屋网${options.categoryName}栏目最新文章`,
    item: items,
    language: "zh-CN",
  };
}
