import { Toast } from '@douyinfe/semi-ui-19';
import { ServerInfo, TestToken } from "@/src/api/simple_api";

/** 服务信息 */
export const ServerInfoService = {
    /** 获取服务信息 */
    get: async () => {
        try {
            const resp = await ServerInfo();
            if (resp.code === 200) {
                return {
                    data: resp.data,
                };
            }
            Toast.error(resp.msg || '获取失败');
            return {data: {}};
        } catch (err) {
            Toast.error('网络请求异常');
            return {data: {}};
        }
    },

    test_token: async () => {
        try {
            const resp = await TestToken();
            if (resp.code !== 200) {
                Toast.error(resp.msg || '测试失败');
                return false;
            }
            return true;
        } catch (err) {
            Toast.error('网络请求异常');
            return false;
        }
    },
}
