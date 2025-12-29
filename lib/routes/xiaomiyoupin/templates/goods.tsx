import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Goods = {
    pic_url?: string;
    img_square?: string;
    imgs?: { img800?: string };
    alt?: string;
    videos_url?: string[];
    name?: string;
    summary?: string;
    market_price?: number;
    price_min?: number;
    flash_price?: number;
};

const GoodsFigure = (goods: Goods) => {
    const imageUrl = goods.pic_url || goods.img_square || goods.imgs?.img800;
    const marketPrice = goods.market_price ? goods.market_price / 100 : undefined;
    const salePrice = goods.price_min ?? goods.flash_price;
    const finalPrice = salePrice ? salePrice / 100 : undefined;

    return (
        <figure>
            <img src={imageUrl} alt={goods.alt} loading="lazy" style="display:block; margin-left:auto; margin-right:auto; width:100%;" />
            {goods.videos_url ? (
                <video
                    controls
                    playsinline="true"
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    x5-video-player-type="h5"
                    x5-video-orientation="landscape|portrait"
                    x5-video-player-fullscreen="true"
                    x-webkit-airplay="allow"
                    preload="metadata"
                    poster={goods.pic_url || goods.imgs?.img800}
                >
                    <source src={goods.videos_url[0]} type="video/mp4" />
                </video>
            ) : null}
            {goods.name ? (
                <figcaption>
                    <div class="caption">{raw(goods.name)}</div>
                    <div class="credit">{raw(goods.summary ?? '')}</div>
                    <div class="price">原始价格：{marketPrice}元</div>
                    <div class="price">实际价格：{finalPrice}元</div>
                </figcaption>
            ) : null}
        </figure>
    );
};

export const renderGoods = (goods: Goods): string => renderToString(<GoodsFigure {...goods} />);
