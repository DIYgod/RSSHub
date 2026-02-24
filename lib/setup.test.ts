import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach } from 'vitest';

const genWeChatMpPage = (rich_media_content: string, scripts: string[] | string) => {
    if (!Array.isArray(scripts)) {
        scripts = [scripts];
    }
    let pageHtml = `
<meta name="description" content="summary" />
<meta name="author" content="author" />
<meta property="og:title" content="title" />
<meta property="og:image" content="https://mmbiz.qpic.cn/rsshub_test/og_img_1/0?wx_fmt=jpeg" />
<meta property="twitter:card" content="summary" />
<div class="rich_media_content" id="js_content" style="visibility: hidden;">
${rich_media_content}
</div>
<div class="wx_follow_nickname">mpName</div>`;
    for (const script of scripts) {
        pageHtml += `
<script type="text/javascript" nonce="000000000">
${script}
</script>`;
    }
    return pageHtml;
};

const server = setupServer(
    http.post(`https://api.openai.mock/v1/chat/completions`, () =>
        HttpResponse.json({
            choices: [
                {
                    message: {
                        content: 'AI processed content.',
                    },
                },
            ],
        })
    ),
    http.get(`http://rsshub.test/config`, () =>
        HttpResponse.json({
            UA: 'test',
        })
    ),
    http.get(`http://rsshub.test/buildData`, () =>
        HttpResponse.text(`<div class="content">
            <ul>
                <li>
                    <a href="/1">1</a>
                    <div class="description">RSSHub1</div>
                    <div class="date">2025-01-01</div>
                </li>
                <li>
                    <a href="/2">2</a>
                    <div class="description">RSSHub2</div>
                    <div class="date">2025-01-02</div>
                </li>
            </ul>
        </div>`)
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/appMsg`, () =>
        HttpResponse.text(
            genWeChatMpPage(
                `
description
<iframe class="video_iframe rich_pages" data-ratio="1.7777777777777777" data-w="864"data-src="https://v.qq.com/rsshub_test/?vid=fake"></iframe>
<mpvoice name="title" voice_encode_fileid="rsshub_test"></mpvoice>
`,
                `
var item_show_type = "0";
var real_item_show_type = "0";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
var msg_source_url = "https://mp.weixin.qq.com/rsshub_test/fake";
window.ip_wording = {
  countryName: '中国',
  countryId: '156',
  provinceName: '福建',
  provinceId: '',
  cityName: '',
  cityId: ''
};`
            )
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/original_empty`, () =>
        HttpResponse.text(
            `<meta name="description" content="summary" />
<meta name="author" content="author" />
<meta property="og:title" content="title" />
<meta property="og:image" content="https://mmbiz.qpic.cn/rsshub_test/og_img_1/0?wx_fmt=jpeg" />
<meta property="twitter:card" content="summary" />
<div class="rich_media_content" id="js_content" style="visibility: hidden;"></div>
<div id="js_share_source" data-url="https://mp.weixin.qq.com/rsshub_test/original_source"></div>
<div class="wx_follow_nickname">mpName</div>
<script type="text/javascript" nonce="000000000">
var item_show_type = "0";
var real_item_show_type = "0";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
var msg_source_url = "https://mp.weixin.qq.com/rsshub_test/fake";
</script>`
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/original_source`, () =>
        HttpResponse.text(
            genWeChatMpPage(
                `original content`,
                `
var item_show_type = "0";
var real_item_show_type = "0";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
var msg_source_url = "https://mp.weixin.qq.com/rsshub_test/fake";`
            )
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/original_long`, () =>
        HttpResponse.text(
            genWeChatMpPage(
                'long-content-'.repeat(10),
                `
var item_show_type = "0";
var real_item_show_type = "0";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
var msg_source_url = "https://mp.weixin.qq.com/rsshub_test/fake";`
            )
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/img`, () =>
        HttpResponse.text(
            genWeChatMpPage('fake_description', [
                `
var item_show_type = "8";
var real_item_show_type = "8";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
`,
                `
window.picture_page_info_list = [
{
  cdn_url: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_1/0?wx_fmt=jpeg',
},
{
  cdn_url: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_2/0?wx_fmt=jpeg',
},
].slice(0, 20);
`,
            ])
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/audio`, () =>
        HttpResponse.text(
            genWeChatMpPage('fake_description', [
                `
var item_show_type = "7";
var real_item_show_type = "7";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
`,
                `
reportOpt = {
  voiceid: "",
  uin: "",
  biz: "",
  mid: "",
  idx: ""
};
window.cgiData = {
  voiceid: "rsshub_test_voiceid_1",
  duration: "6567" * 1,
};
`,
            ])
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/video`, () =>
        HttpResponse.text(
            genWeChatMpPage(
                'fake_description',
                `
var item_show_type = "5";
var real_item_show_type = "5";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
`
            )
        )
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/fallback`, () =>
        HttpResponse.text(
            genWeChatMpPage(
                'fake_description',
                `
var item_show_type = "99988877";
var real_item_show_type = "99988877";
var appmsg_type = "9";
var ct = "${1_636_626_300}";
`
            )
        )
    ),
    http.get(`https://mp.weixin.qq.com/s/rsshub_test`, () => HttpResponse.redirect(`https://mp.weixin.qq.com/rsshub_test/fallback`)),
    http.get(`https://mp.weixin.qq.com/s?__biz=rsshub_test&mid=1&idx=1&sn=1`, () => HttpResponse.redirect(`https://mp.weixin.qq.com/rsshub_test/fallback`)),
    http.get(`https://mp.weixin.qq.com/mp/rsshub_test/waf`, () =>
        HttpResponse.text(
            `<html>
<head>
<title>Title</title>
<script>console.log</script>
</head>
<body class="zh_CN " ontouchstart="">
<script>console.log</script>
<style>.style{}</style>
<div class="weui-msg">
  <div id="tips" style="display:none;" class="top_tips warning"></div>
        <div class="weui-msg__icon-area">
      <i class="weui-icon-info-circle weui-icon_msg"></i>
    </div>
    <div class="weui-msg__text-area pc-area">
        <h2 class="weui-msg__title">环境异常</h2>
        <p class="weui-msg__desc">当前环境异常，完成验证后即可继续访问。</p>
    </div>
    <div class="weui-msg__opr-area">
      <p class="weui-btn-area">
        <a class="weui-btn weui-btn_primary" id="js_verify">去验证</a>
      </p>
    </div>
</div>
</body></html>`
        )
    ),
    http.get(`https://mp.weixin.qq.com/s/rsshub_test_hit_waf`, () => HttpResponse.redirect(`https://mp.weixin.qq.com/mp/rsshub_test/waf`)),
    http.get(`https://mp.weixin.qq.com/s/unknown_page`, () =>
        HttpResponse.text(
            `<html>
<head>
<title>Title</title>
<script>console.log</script>
</head>
<body class="zh_CN " ontouchstart="">
<script>console.log</script>
<style>.style{}</style>
<p>
Unknown paragraph
</p>
</body></html>`
        )
    ),
    http.get(`https://mp.weixin.qq.com/s/deleted_page`, () =>
        HttpResponse.text(
            `<html>
<head>
<title>Title</title>
<script>console.log</script>
</head>
<body class="zh_CN " ontouchstart="">
<script>console.log</script>
<style>.style{}</style>
<p>
该内容已被发布者删除
</p>
</body></html>`
        )
    ),
    http.get(`https://mp.weixin.qq.com/s/rsshub_test_redirect_no_location`, () => HttpResponse.text('', { status: 302 })),
    http.get(`https://mp.weixin.qq.com/s/rsshub_test_recursive_redirect`, () => HttpResponse.redirect(`https://mp.weixin.qq.com/s/rsshub_test_recursive_redirect`)),
    http.get(`http://rsshub.test/headers`, ({ request }) => HttpResponse.json(Object.fromEntries(request.headers.entries()))),
    http.post(`http://rsshub.test/form-post`, async ({ request }) => {
        const formData = await request.formData();
        return HttpResponse.json({
            test: formData.get('test'),
            req: { headers: Object.fromEntries(request.headers.entries()) },
        });
    }),
    http.post(`http://rsshub.test/json-post`, async ({ request }) => {
        const jsonData = (await request.json()) as {
            test: string;
        };
        return HttpResponse.json({
            test: jsonData?.test,
        });
    }),
    http.get(`http://rsshub.test/rss`, () => HttpResponse.text('<rss version="2.0"><channel><item></item></channel></rss>'))
);
server.listen();

afterAll(() => server.close());
afterEach(() => server.resetHandlers());

export default server;
