function absolutize(url: string | undefined, baseUrl: string) {
    if (!url) {return '';}
    try {
        return new URL(url, baseUrl).href;
    } catch {
        // 兜底处理 protocol-relative //xx
        if (url.startsWith('//')) {return `https:${url}`;}
        return url;
    }
}

// 懒加载图片还原（仅作用于传入的 $root 范围）
function normalizeLazyImages($: CheerioAPI, $root: ReturnType<CheerioAPI>, baseUrl: string) {
    // 1) 处理 <img>
    $root.find('img').each((_, el: Element) => {
        const $img = $(el);
        const lazySrc = $img.attr('data-lazy-src') || $img.attr('data-src') || $img.attr('data-original');

        // noscript 兜底
        let nsSrc = '';
        const $figure = $img.closest('figure');
        const $nsImg = ($figure.length ? $figure : $img.parent()).find('noscript img').first();
        if ($nsImg.length) {nsSrc = $nsImg.attr('src') || '';}

        const real = lazySrc || nsSrc || $img.attr('src');
        if (real) {$img.attr('src', absolutize(real, baseUrl));}

        // 还原 srcset（如有）
        const lazySrcset = $img.attr('data-lazy-srcset') || $img.attr('data-srcset');
        if (lazySrcset && !$img.attr('srcset')) {
            $img.attr('srcset', lazySrcset);
        }

        // 清理懒加载相关属性，避免阅读器误判
        $img.removeAttr('data-lazy-src data-src data-original data-lazy-srcset data-srcset loading');
    });

    // 2) 处理 <picture><source> 的 data-srcset
    $root.find('picture source').each((_, el: Element) => {
        const $source = $(el);
        const ds = $source.attr('data-srcset');
        if (ds && !$source.attr('srcset')) {
            $source.attr('srcset', ds);
            $source.removeAttr('data-srcset');
        }
    });

    // 3) 移除 noscript，避免重复显示
    $root.find('noscript').remove();
}
export { normalizeLazyImages };
