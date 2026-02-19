import { renderToString } from 'hono/jsx/dom/server';

type PriceInfo = {
    finalPrice?: number;
    regPrice?: number;
    salePrice?: number;
};

type DescriptionData = {
    availability?: string | string[];
    releaseDateDisplay?: string;
    price?: PriceInfo;
    genres?: string[];
    softwareDeveloper?: string;
    softwarePublisher?: string;
    description?: string;
};

export const renderEshopUsDescription = (data: DescriptionData) =>
    renderToString(
        <>
            <p>
                {data.availability && data.availability.includes('Pre-order') ? (
                    <>
                        预售中
                        <br />
                    </>
                ) : null}
                {data.releaseDateDisplay ? <>预计发售时间：{data.releaseDateDisplay}</> : null}
                {data.price ? (
                    <>
                        当前价格：{data.price.finalPrice === 0 ? '免费' : `$${data.price.finalPrice}`}
                        <br />
                        {data.price.salePrice ? (
                            <>
                                原价：${data.price.regPrice}
                                <br />
                            </>
                        ) : null}
                    </>
                ) : null}
                {data.genres ? (
                    <>
                        类别：{data.genres.join(', ')}
                        <br />
                    </>
                ) : null}
                {data.softwareDeveloper ? (
                    <>
                        开发商：{data.softwareDeveloper}
                        <br />
                    </>
                ) : null}
                {data.softwarePublisher ? (
                    <>
                        发行商：{data.softwarePublisher}
                        <br />
                    </>
                ) : null}
            </p>
            <p>{data.description}</p>
        </>
    );
