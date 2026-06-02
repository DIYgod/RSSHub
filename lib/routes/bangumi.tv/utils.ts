export function bbcodeToHtml(content: string): string {
    let html = content;

    // 代码块（需要先处理，避免内部被转换）
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre><code>$1</code></pre>');

    // 引用
    html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote>$1</blockquote>');

    // 标题
    html = html.replace(/\[h\]([\s\S]*?)\[\/h\]/gi, '<h3>$1</h3>');

    // 文本格式
    html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
    html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
    html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
    html = html.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<del>$1</del>');

    // 字号
    html = html.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>');

    // 颜色
    html = html.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>');

    // 对齐
    html = html.replace(/\[align=(left|center|right)\]([\s\S]*?)\[\/align\]/gi, '<div style="text-align:$1">$2</div>');

    // 链接
    html = html.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank">$2</a>');
    html = html.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank">$1</a>');

    // 图片
    html = html.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" style="max-width:100%" />');

    // 视频（简化处理，转为链接），Bangumi 目前暂时没有此标签
    html = html.replace(/\[video\]([\s\S]*?)\[\/video\]/gi, '<a href="$1" target="_blank">[视频]</a>');

    // 列表
    html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (match, content) => {
        const items = content.replace(/\[\*\]([^\[]*)/g, '<li>$1</li>');
        return `<ul>${items}</ul>`;
    });

    // 分割线
    html = html.replace(/\[hr\]/gi, '<hr>');

    // 剧透遮罩
    html = html.replace(/\[mask\]([\s\S]*?)\[\/mask\]/gi, '<details><summary>剧透</summary>$1</details>');

    // Bangumi 特有标签 - 关联条目
    html = html.replace(/\[subject=(\d+)\]([\s\S]*?)\[\/subject\]/gi, '<a href="https://bgm.tv/subject/$1" target="_blank">$2</a>');
    html = html.replace(/\[group=(\d+)\]([\s\S]*?)\[\/group\]/gi, '<a href="https://bgm.tv/group/$1" target="_blank">$2</a>');

    // Bangumi 特有标签 - 用户照片
    html = html.replace(/\[photo=\d+\]([\s\S]*?)\[\/photo\]/gi, '<img src="//lain.bgm.tv/pic/photo/l/$1" alt="" loading="lazy" />');

    // 换行处理：段落分组
    html = html
        .split(/\r?\n/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p}</p>`)
        .join('');

    return html;
}
