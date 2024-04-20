import got from '@/utils/got';

/**
 *
 *
 * @author CaoMeiYouRen
 * @date 2022-12-18
 * @param {string[]} [modules=[]] localCityNCOVDataList,diseaseh5Shelf,nowConfirmStatis,provinceCompare,FAutoforeignList,FAutoCountryConfirmAdd,WomWorld,WomAboard,VaccineTopData
 */
const getData = async (modules = []) => {
    const response = await got('https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list?modules=' + modules.join(','));
    return response.data;
};

export { getData };
