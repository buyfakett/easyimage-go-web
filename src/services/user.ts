import { UserAPI } from '@/src/api/user';
import { Toast } from '@douyinfe/semi-ui-19';
import {
    TestTokenParams,
} from "@/src/api/user/types";

/** 用户 */
export const UserService = {
    /** 生成验证码 */
    getCaptcha: async () => {
        try {
            const resp = await UserAPI.GenerateCaptcha();
            if (resp.code === 200) {
                return resp.data;
            }
            Toast.error(resp.msg || '生成验证码失败');
            return null;
        } catch (err) {
            Toast.error('网络请求异常');
            return null;
        }
    },
    /** 获取用户列表 */
    testToken: async (params: TestTokenParams) => {
        try {
            const resp = await UserAPI.TestToken(params);
            if (resp.code !== 200) {
                Toast.error(resp.msg || '测试token失败');
                return null;
            }
            return "success";
        } catch (err) {
            Toast.error('网络请求异常');
            return null;
        }
    },
};
