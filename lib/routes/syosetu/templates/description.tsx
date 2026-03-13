import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    novel: {
        story?: string;
        novel_type: number;
        end: number;
        general_all_no: number;
        keyword: string;
        general_lastup: string;
        ncode: string;
        time: number;
        length: number;
        weekly_unique?: number;
        global_point: number;
        all_hyoka_cnt: number;
        all_point: number;
        fav_novel_cnt: number;
        sasie_cnt: number;
    };
    genreText?: string;
};

const SyosetuDescription = ({ novel, genreText }: DescriptionData) => (
    <>
        {novel.story ? <p>{raw(novel.story.replaceAll('\n', '<br>'))}</p> : null}
        <h2>作品情報</h2>
        <table>
            <tr>
                <td>状態</td>
                <td>
                    {novel.novel_type === 2 ? (
                        '短編'
                    ) : (
                        <>
                            {novel.end === 0 ? '完結済' : '連載中'}（全{novel.general_all_no}エピソード）
                        </>
                    )}
                </td>
            </tr>
            {genreText ? (
                <tr>
                    <td>ジャンル</td>
                    <td>{genreText}</td>
                </tr>
            ) : null}
            <tr>
                <td>キーワード</td>
                <td>{novel.keyword.replaceAll(' ', '、')}</td>
            </tr>
            <tr>
                <td>最終掲載</td>
                <td>{novel.general_lastup}</td>
            </tr>
            <tr>
                <td>Nコード</td>
                <td>{novel.ncode}</td>
            </tr>
            <tr>
                <td>読了時間</td>
                <td>
                    約{novel.time}分（{novel.length}文字）
                </td>
            </tr>
        </table>
        <br />
        <table>
            {novel.weekly_unique ? (
                <tr>
                    <td>週別ユニークユーザ</td>
                    <td>{novel.weekly_unique < 100 ? '100未満' : novel.weekly_unique}</td>
                </tr>
            ) : null}
            <tr>
                <td>総合ポイント</td>
                <td>{novel.global_point} pt</td>
            </tr>
            <tr>
                <td>評価人数</td>
                <td>{novel.all_hyoka_cnt} 人</td>
            </tr>
            <tr>
                <td>評価ポイント</td>
                <td>{novel.all_point} pt</td>
            </tr>
            <tr>
                <td>ブックマーク</td>
                <td>{novel.fav_novel_cnt} 件</td>
            </tr>
        </table>
        {novel.sasie_cnt > 0 ? <p>挿絵数：{novel.sasie_cnt}枚</p> : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<SyosetuDescription {...data} />);
