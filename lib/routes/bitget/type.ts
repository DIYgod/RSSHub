export interface BitgetResponse {
    code: string;
    data: {
        endId: string;
        hasNextPage: boolean;
        hasPrePage: boolean;
        items: Array<{
            businessType?: number;
            content?: string;
            id: string;
            imgUrl?: string;
            openUrl?: string;
            openUrlName?: string;
            readStats?: number;
            sendTime?: string;
            stationLetterType?: string;
            title?: string;
        }>;
        notifyFlag: boolean;
        page: number;
        pageSize: number;
        startId: string;
        total: number;
    };
    params: any[];
}
