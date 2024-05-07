interface Likeicon {
    action_url: string;
    end_url: string;
    id: number;
    start_url: string;
}
interface Basic {
    comment_id_str: string;
    comment_type: number;
    jump_url?: string;
    like_icon: Likeicon;
    rid_str: string;
}
interface Containersize {
    height: number;
    width: number;
}
interface Posspec {
    axis_x: number;
    axis_y: number;
    coordinate_pos: number;
}
interface Renderspec {
    opacity: number;
}
interface Generalspec {
    pos_spec: Posspec;
    render_spec: Renderspec;
    size_spec: Containersize;
}
interface AVATARLAYER {}
interface Webcssstyle {
    borderRadius: string;
    'background-color'?: string;
    border?: string;
    boxSizing?: string;
}
interface Generalconfig {
    web_css_style: Webcssstyle;
}
interface GENERALCFG {
    config_type: number;
    general_config: Generalconfig;
}
interface Tags {
    AVATAR_LAYER?: AVATARLAYER;
    GENERAL_CFG: GENERALCFG;
    ICON_LAYER?: AVATARLAYER;
}
interface Layerconfig {
    is_critical?: boolean;
    tags: Tags;
}
interface Remote {
    bfs_style: string;
    url: string;
}
interface Imagesrc {
    placeholder?: number;
    remote?: Remote;
    src_type: number;
    local?: number;
}
interface Resimage {
    image_src: Imagesrc;
}
interface Resource {
    res_image: Resimage;
    res_type: number;
}
interface Layer {
    general_spec: Generalspec;
    layer_config: Layerconfig;
    resource: Resource;
    visible: boolean;
}
interface Fallbacklayers {
    is_critical_group: boolean;
    layers: Layer[];
}
interface Avatar {
    container_size: Containersize;
    fallback_layers: Fallbacklayers;
    mid: string;
}
interface Fan {
    color: string;
    is_fan: boolean;
    num_str: string;
    number: number;
}
interface Decorate {
    card_url: string;
    fan: Fan;
    id: number;
    jump_url: string;
    name: string;
    type: number;
}
interface Officialverify {
    desc: string;
    type: number;
}
interface Pendant {
    expire: number;
    image: string;
    image_enhance: string;
    image_enhance_frame: string;
    n_pid: number;
    name: string;
    pid: number;
}
interface Label {
    bg_color: string;
    bg_style: number;
    border_color: string;
    img_label_uri_hans: string;
    img_label_uri_hans_static: string;
    img_label_uri_hant: string;
    img_label_uri_hant_static: string;
    label_theme: string;
    path: string;
    text: string;
    text_color: string;
    use_img_label: boolean;
}
interface Vip {
    avatar_subscript: number;
    avatar_subscript_url: string;
    due_date: number;
    label: Label;
    nickname_color: string;
    status: number;
    theme_type: number;
    type: number;
}
interface Moduleauthor {
    avatar: Avatar;
    decorate?: Decorate;
    face: string;
    face_nft: boolean;
    following: boolean;
    jump_url: string;
    label: string;
    mid: number;
    name: string;
    official_verify: Officialverify;
    pendant: Pendant;
    pub_action: string;
    pub_location_text?: string;
    pub_time: string;
    pub_ts: number;
    type: AuthorType;
    vip: Vip;
}
interface Jumpstyle {
    icon_url: string;
    text: string;
}
interface Button {
    jump_style: Jumpstyle;
    jump_url: string;
    type: number;
}

interface Common {
    button: Button;
    cover: string;
    desc1: string;
    desc2: string;
    head_text: string;
    id_str: string;
    jump_url: string;
    style: number;
    sub_type: string;
    title: string;
}
interface Additional {
    common: Common;
    type: string;
}
interface Richtextnode {
    orig_text: string;
    rid?: string;
    text: string;
    type: string;
    jump_url?: string;
    emoji?: Emoji;
    pics?: Pic2[];
}
interface Pic2 {
    height: number;
    size: number;
    src: string;
    width: number;
}

interface Desc {
    rich_text_nodes: Richtextnode[];
    text: string;
}
interface Pic {
    height: number;
    size: number;
    url: string;
    width: number;
}
interface Opus {
    fold_action: string[];
    jump_url: string;
    pics: Pic[];
    summary: Desc;
    title?: string;
}
interface Badge {
    bg_color: string;
    color: string;
    icon_url?: string;
    text: string;
}
interface Stat {
    danmaku: string;
    play: string;
}
interface Pgc {
    badge: Badge;
    cover: string;
    epid: number;
    jump_url: string;
    season_id: number;
    stat: Stat;
    stat_hidden: number;
    sub_type: number;
    title: string;
    type: number;
}
interface Live {
    badge: Badge;
    cover: string;
    desc_first: string;
    desc_second: string;
    id: number;
    jump_url: string;
    live_state: number;
    reserve_type: number;
    title: string;
}
interface Common2 {
    badge: Badge;
    biz_type: number;
    cover: string;
    desc: string;
    id: string;
    jump_url: string;
    label: string;
    sketch_id: string;
    style: number;
    title: string;
}
interface Archive {
    aid: string;
    badge: Badge;
    bvid: string;
    cover: string;
    desc: string;
    disable_preview: number;
    duration_text: string;
    jump_url: string;
    stat: Stat;
    title: string;
    type: number;
}
interface UgcSeason {
    aid: number; // 视频AV号
    badge: Badge; // 角标信息
    cover: string; // 视频封面
    desc: string; // 视频简介
    disable_preview: number; // 0
    duration_text: string; // 时长
    jump_url: string; // 跳转URL
    stat: Stat; // 统计信息
    title: string; // 视频标题
}

interface Article {
    covers: string[]; // 封面图数组,最多三张
    desc: string; // 文章摘要
    id: number; // 文章CV号
    jump_url: string; // 文章跳转地址
    label: string; // 文章阅读量
    title: string; // 文章标题
}

interface DrawItem {
    height: number; // 图片高度
    size: number; // 图片大小,单位KB
    src: string; // 图片URL
    tags: any[]; // 标签数组
    width: number; // 图片宽度
}

interface Draw {
    id: number; // 对应相簿id
    items: DrawItem[]; // 图片信息列表
}

interface LiveRcmd {
    content: string; // 直播间内容JSON
    reserve_type: number; // 0
}

interface Course {
    badge: Badge; // 角标信息
    cover: string; // 封面图URL
    desc: string; // 更新状态描述
    id: number; // 课程id
    jump_url: string; // 跳转URL
    sub_title: string; // 课程副标题
    title: string; // 课程标题
}

interface Music {
    cover: string; // 音频封面
    id: number; // 音频AUID
    jump_url: string; // 跳转URL
    label: string; // 音频分类
    title: string; // 音频标题
}

interface None {
    tips: string; // 动态失效显示文案
}

interface Major {
    type: MajorType;
    ugc_season?: UgcSeason; // 合集信息
    article?: Article; // 专栏
    draw?: Draw; // 带图动态
    archive?: Archive; // 视频信息
    live_rcmd?: LiveRcmd; // 直播状态
    common?: Common2; // 一般类型
    opus?: Opus; // 图文动态
    pgc?: Pgc; // 剧集信息
    courses?: Course; // 课程信息
    music?: Music; // 音频信息
    live?: Live; // 直播信息
    none?: None; // 动态失效
}
interface Topic {
    id: number; // 话题id
    jump_url: string; // 跳转URL
    name: string; // 话题名称
}

interface Moduledynamic {
    additional?: Additional;
    desc?: Desc;
    major?: Major;
    topic?: Topic;
}
interface Emoji {
    icon_url: string;
    size: number;
    text: string;
    type: number;
}

interface Item {
    desc: Desc;
    type: number;
}
interface Moduleinteraction {
    items: Item[];
}
interface Threepointitem {
    label: string;
    type: string;
}
interface Modulemore {
    three_point_items: Threepointitem[];
}
interface Comment {
    count: number;
    forbidden: boolean;
}
interface Like {
    count: number;
    forbidden: boolean;
    status: boolean;
}
interface Modulestat {
    comment: Comment;
    forward: Comment;
    like: Like;
}
interface Moduletag {
    text: string;
}
interface Modules {
    module_author?: Moduleauthor;
    module_dynamic?: Moduledynamic;
    module_interaction?: Moduleinteraction;
    module_more?: Modulemore;
    module_stat?: Modulestat;
    module_tag?: Moduletag;
}

export interface Orig {
    basic: Basic;
    id_str: string;
    modules: Modules;
    type: DynamicType;
    visible: boolean;
}
export interface Item2 {
    basic: Basic;
    id_str: string;
    modules: Modules;
    type: DynamicType;
    visible: boolean;
    orig?: Orig;
}
export interface Data {
    has_more: boolean;
    items: Item2[];
    offset: string;
    update_baseline: string;
    update_num: number;
}
// https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space
export interface BilibiliWebDynamicResponse {
    code: number;
    message: string;
    ttl: number;
    data: Data;
}

/**
 * 作者类型
 * 更多类型请参考：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/dynamic/dynamic_enum.md#%E4%BD%9C%E8%80%85%E7%B1%BB%E5%9E%8B
 */
export type AuthorType = 'AUTHOR_TYPE_PGC' | 'AUTHOR_TYPE_NORMAL' | 'AUTHOR_TYPE_UGC_SEASON' | 'AUTHOR_TYPE_NONE';

/**
 * 动态类型
 * 更多类型请参考：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/dynamic/dynamic_enum.md#%E5%8A%A8%E6%80%81%E7%B1%BB%E5%9E%8B
 */
export type DynamicType =
    | 'DYNAMIC_TYPE_NONE' // 无效动态, 示例: 716510857084796964
    | 'DYNAMIC_TYPE_FORWARD' // 动态转发
    | 'DYNAMIC_TYPE_AV' // 投稿视频
    | 'DYNAMIC_TYPE_PGC' // 剧集（番剧、电影、纪录片）
    | 'DYNAMIC_TYPE_COURSES' // 课程
    | 'DYNAMIC_TYPE_WORD' // 纯文字动态, 示例: 718377531474968613
    | 'DYNAMIC_TYPE_DRAW' // 带图动态, 示例: 718384798557536290
    | 'DYNAMIC_TYPE_ARTICLE' // 投稿专栏, 示例: 718372214316990512
    | 'DYNAMIC_TYPE_MUSIC' // 音乐
    | 'DYNAMIC_TYPE_COMMON_SQUARE' // 装扮, 剧集点评, 普通分享, 示例: 551309621391003098, 716503778995470375, 716481612656672789
    | 'DYNAMIC_TYPE_COMMON_VERTICAL' // 垂直动态
    | 'DYNAMIC_TYPE_LIVE' // 直播间分享, 示例: 216042859353895488
    | 'DYNAMIC_TYPE_MEDIALIST' // 收藏夹, 示例: 534428265320147158
    | 'DYNAMIC_TYPE_COURSES_SEASON' // 课程, 示例: 717906712866062340
    | 'DYNAMIC_TYPE_COURSES_BATCH' // 课程批次
    | 'DYNAMIC_TYPE_AD' // 广告
    | 'DYNAMIC_TYPE_APPLET' // 小程序
    | 'DYNAMIC_TYPE_SUBSCRIPTION' // 订阅
    | 'DYNAMIC_TYPE_LIVE_RCMD' // 直播开播, 示例: 718371505648435205
    | 'DYNAMIC_TYPE_BANNER' // 横幅
    | 'DYNAMIC_TYPE_UGC_SEASON' // 合集更新, 示例: 718390979031203873
    | 'DYNAMIC_TYPE_SUBSCRIPTION_NEW'; // 新订阅
/**
 * 动态主体类型
 * 更多类型请参考：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/dynamic/dynamic_enum.md#%E5%8A%A8%E6%80%81%E4%B8%BB%E4%BD%93%E7%B1%BB%E5%9E%8B
 */
export type MajorType =
    | 'MAJOR_TYPE_NONE' // 动态失效, 示例: 716510857084796964
    | 'MAJOR_TYPE_NONE' // 转发动态, 示例: 866756840240709701
    | 'MAJOR_TYPE_OPUS' // 图文动态, 示例: 870176712256651305
    | 'MAJOR_TYPE_ARCHIVE' // 视频, 示例: 716526237365829703
    | 'MAJOR_TYPE_PGC' // 剧集更新, 示例: 645981661420322824
    | 'MAJOR_TYPE_COURSES' // 课程
    | 'MAJOR_TYPE_DRAW' // 带图动态, 示例: 716358050743582725
    | 'MAJOR_TYPE_ARTICLE' // 文章
    | 'MAJOR_TYPE_MUSIC' // 音频更新
    | 'MAJOR_TYPE_COMMON' // 一般类型, 示例: 716481612656672789
    | 'MAJOR_TYPE_LIVE' // 直播间分享, 示例: 267505569812738175
    | 'MAJOR_TYPE_MEDIALIST' // 收藏夹
    | 'MAJOR_TYPE_APPLET' // 小程序
    | 'MAJOR_TYPE_SUBSCRIPTION' // 订阅
    | 'MAJOR_TYPE_LIVE_RCMD' // 直播状态
    | 'MAJOR_TYPE_UGC_SEASON' // 合计更新, 示例: 716509100448415814
    | 'MAJOR_TYPE_SUBSCRIPTION_NEW'; // 新订阅
