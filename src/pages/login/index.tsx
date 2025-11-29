import React, { useState } from 'react';
import { Button, Input, Typography } from '@douyinfe/semi-ui-19';
import { IconKey } from '@douyinfe/semi-icons';
import { APP_LOGIN_REDIRECT_URI, APP_NAME } from "@/src/config";
import { useNavigate } from "react-router-dom";
import { ServerInfoService } from "@/src/services/server_info";
import { setToken, removeToken } from "@/src/utils/auth";

const {Text} = Typography;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [token, setTokenValue] = useState('');

    let default_token = '';
    if (process.env.NODE_ENV !== 'production') {
        default_token = '123qazwsxedc456';
    }

    const handleLogin = async () => {
        if (!token.trim()) {
            return;
        }

        setLoading(true);
        try {
            // 设置token到存储
            setToken(token);
            // 调用test_token验证
            const isValid = await ServerInfoService.test_token();
            if (isValid) {
                navigate(APP_LOGIN_REDIRECT_URI);
                setToken(token);
            } else {
                // 验证失败，清除token
                setTokenValue('');
                removeToken();
            }
        } catch (error) {
            console.error('登录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className='flex flex-col gap-8 p-8 rounded-lg w-[600px] h-[350px]'
            style={{
                border: '1px solid var(--semi-color-border)',
                backgroundColor: 'var(--semi-color-bg-1)', // 自动适配深色模式
            }}
        >
            <div className="flex flex-col items-center mb-6">
                <Text className="text-3xl font-bold text-[--semi-color-primary]">欢迎登录 {APP_NAME}</Text>
                <Text className="text-sm text-[--semi-color-text-2] mt-2">请输入您的认证Token</Text>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">认证Token</label>
                    <Input
                        prefix={<IconKey/>}
                        showClear
                        placeholder="请输入认证Token"
                        value={token}
                        defaultValue={default_token}
                        onChange={(value) => setTokenValue(value)}
                        className="w-full"
                    />
                </div>

                <Button
                    type="primary"
                    theme="solid"
                    loading={loading}
                    onClick={handleLogin}
                    className="w-full h-10 rounded-lg"
                    style={{fontWeight: 600, marginTop: '20px'}}
                >
                    登录
                </Button>
            </div>

        </div>
    );
};

export default Login;