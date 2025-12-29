import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Voucher = {
    title?: string;
    description?: string;
    activateDate?: string;
    expirationDate?: string;
    totalLimit?: string;
    hasSurplus?: boolean;
};

type Merchant = {
    name?: string;
    province?: string;
    city?: string;
    area?: string;
    address?: string;
    contact?: string;
};

type DataPayload = {
    images?: string[];
    categories?: string[];
    description?: string;
    vouchers?: Voucher[];
    merchants?: Merchant[];
};

type ImagePayload = {
    src?: string;
    alt?: string;
};

type DescriptionParams = {
    data?: DataPayload;
    image?: ImagePayload;
    description?: string;
    categoryToUrl?: (category: string) => string;
    mediaToUrl?: (media: string) => string;
};

export const renderDescription = ({ data, image, description, categoryToUrl, mediaToUrl }: DescriptionParams) =>
    renderToString(
        <>
            {data ? (
                <>
                    {data.images?.length
                        ? data.images.map((media) => (
                              <figure key={media}>
                                  <img src={mediaToUrl ? mediaToUrl(media) : media} />
                              </figure>
                          ))
                        : null}
                    {data.categories?.length
                        ? data.categories.map((category) => (
                              <a href={categoryToUrl ? categoryToUrl(category) : category} key={category}>
                                  {category}
                              </a>
                          ))
                        : null}
                    {data.description ? <p>{data.description}</p> : null}
                    {data.vouchers?.length ? (
                        <>
                            <h1>相关权益</h1>
                            <ul>
                                {data.vouchers.map((voucher, index) => (
                                    <li key={voucher.title ?? index}>
                                        <div>
                                            {voucher.title ? <h2>{voucher.title}</h2> : null}
                                            {voucher.description ? (
                                                <>
                                                    <h3>使用说明</h3>
                                                    <>{raw(voucher.description)}</>
                                                </>
                                            ) : null}
                                            {voucher.activateDate || voucher.expirationDate ? (
                                                <>
                                                    <h3>有效期</h3>
                                                    {voucher.activateDate ? (
                                                        <>
                                                            <b>{voucher.activateDate.split(/T/)[0]}</b> 起
                                                        </>
                                                    ) : null}
                                                    {voucher.expirationDate ? (
                                                        <>
                                                            <b>{voucher.expirationDate.split(/T/)[0]}</b> 止
                                                        </>
                                                    ) : null}
                                                </>
                                            ) : null}
                                            {voucher.totalLimit ? (
                                                <>
                                                    <h3>总计</h3>
                                                    <p>{voucher.totalLimit}</p>
                                                </>
                                            ) : null}
                                            <h3>状态</h3>
                                            <p>{voucher.hasSurplus ? '可领取' : '已领完'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                    {data.merchants?.length ? (
                        <>
                            <h1>适用门店</h1>
                            <ul>
                                {data.merchants.map((merchant, index) => (
                                    <li key={merchant.name ?? index}>
                                        <div>
                                            {merchant.name ? <h2>{merchant.name}</h2> : null}
                                            {merchant.province ? <span>{merchant.province}</span> : null}
                                            {merchant.city && merchant.city !== merchant.province ? <span>{merchant.city}</span> : null}
                                            {merchant.area && merchant.area !== merchant.city ? <span>{merchant.area}</span> : null}
                                            {merchant.address ? <span>{merchant.address}</span> : null}
                                            {merchant.contact ? (
                                                <p>
                                                    <a href={`tel:${merchant.contact}`}>{merchant.contact}</a>
                                                </p>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </>
            ) : (
                <>
                    {image ? (
                        <figure>
                            <img src={image.src} alt={image.alt} />
                        </figure>
                    ) : null}
                    {description ? <>{raw(description)}</> : null}
                </>
            )}
        </>
    );
