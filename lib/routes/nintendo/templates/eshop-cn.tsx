import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type NormalPlayersNum = {
    min?: number;
    max?: number;
};

type AgeAppropriateInfo = {
    text?: string;
};

type Software = {
    coverImage?: string;
    descriptionTitle?: string;
    descriptionContent?: string;
    price?: string;
    currency?: string;
    sizeNum?: string;
    sizeUnit?: string;
    playMode?: string[];
    normalPlayersNum?: NormalPlayersNum;
    handleSupport?: string;
    platform?: string;
    publisher?: string;
    genre?: string[];
    supportLanguages?: string[];
    ageAppropriateInfo?: AgeAppropriateInfo;
    images?: string[];
};

type Item = {
    description?: string;
};

type DescriptionParams = {
    item: Item;
    software: Software;
    releaseDatetime?: string;
};

export const renderEshopCnDescription = ({ item, software, releaseDatetime }: DescriptionParams) => {
    const normalPlayers = software.normalPlayersNum
        ? software.normalPlayersNum.max === software.normalPlayersNum.min
            ? software.normalPlayersNum.max
            : `${software.normalPlayersNum.min}-${software.normalPlayersNum.max}`
        : undefined;

    return renderToString(
        <>
            {software.coverImage ? <img src={`https:${software.coverImage}`} /> : item.description ? <>{raw(item.description)}</> : null}
            <h1>{software.descriptionTitle}</h1>
            {software.descriptionContent ? (
                <>
                    {raw(software.descriptionContent.replaceAll('\n', '<br>'))}
                    <br />
                    <br />
                </>
            ) : null}
            <table>
                {software.price ? (
                    <tr>
                        <th>建议零售价</th>
                        <td>
                            {software.price} {software.currency}
                        </td>
                    </tr>
                ) : null}
                {software.sizeNum ? (
                    <tr>
                        <th>游戏大小</th>
                        <td>
                            {software.sizeNum} {software.sizeUnit}
                        </td>
                    </tr>
                ) : null}
                {software.playMode ? (
                    <tr>
                        <th>游戏模式</th>
                        <td>{software.playMode.join(', ')}</td>
                    </tr>
                ) : null}
                {normalPlayers ? (
                    <tr>
                        <th>游戏人数</th>
                        <td>{normalPlayers}</td>
                    </tr>
                ) : null}
                {software.handleSupport ? (
                    <tr>
                        <th>手柄支持</th>
                        <td>{software.handleSupport}</td>
                    </tr>
                ) : null}
                {software.platform ? (
                    <tr>
                        <th>平台</th>
                        <td>{software.platform}</td>
                    </tr>
                ) : null}
                {software.publisher ? (
                    <tr>
                        <th>发行商</th>
                        <td>{software.publisher}</td>
                    </tr>
                ) : null}
                {software.genre ? (
                    <tr>
                        <th>类型</th>
                        <td>{software.genre.join('/')}</td>
                    </tr>
                ) : null}
                {releaseDatetime ? (
                    <tr>
                        <th>发售日</th>
                        <td>{releaseDatetime}</td>
                    </tr>
                ) : null}
                {software.supportLanguages ? (
                    <tr>
                        <th>支持语言</th>
                        <td>{software.supportLanguages.join('/')}</td>
                    </tr>
                ) : null}
                {software.ageAppropriateInfo ? (
                    <tr>
                        <th>适龄信息</th>
                        <td>{software.ageAppropriateInfo.text ? raw(software.ageAppropriateInfo.text.replaceAll('\n', '<br>')) : null}</td>
                    </tr>
                ) : null}
            </table>
            <br />
            {software.images?.length ? software.images.slice(1).map((image, index) => <img src={`https:${image}`} key={`${image}-${index}`} />) : null}
        </>
    );
};
