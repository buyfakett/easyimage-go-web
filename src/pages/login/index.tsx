import React, { useEffect, useState } from 'react';
import { Button, Input, Typography } from '@douyinfe/semi-ui-19';
import { IconKey } from '@douyinfe/semi-icons';
import { APP_LOGIN_REDIRECT_URI, APP_NAME } from "@/src/config";
import { useNavigate } from "react-router-dom";
import { setToken, removeToken } from "@/src/utils/auth";
import { UserService } from "@/src/services/user";

const {Text} = Typography;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [captchaId, setCaptchaId] = useState<string>('');
    const [captcha, setCaptcha] = useState<string>('');
    const [captchaImage, setCaptchaImage] = useState<string>('');
    const [token, setTokenValue] = useState('');

    // 生成验证码
    const generateCaptcha = async () => {
        const captchaData = await UserService.getCaptcha();
        if (captchaData) {
            setCaptchaId(captchaData.id);
            setCaptchaImage(captchaData.base64_image);
        }
    };

    useEffect(() => {
            // 生成验证码
            generateCaptcha();
            if (process.env.NODE_ENV !== 'production') {
                setTokenValue('123qazwsxedc456');
            }
    }, []);

    const handleLogin = async () => {
        if (!token.trim()) {
            return;
        }
        setLoading(true);
        try {
            // 调用test_token验证
            const isValid = await UserService.testToken({
                token: token,
                captcha_id: captchaId,
                captcha: captcha,
            });
            if (isValid) {
                navigate(APP_LOGIN_REDIRECT_URI);
                setToken(token);
            } else {
                // 验证失败，清除token
                setTokenValue('');
                removeToken();
                if (process.env.NODE_ENV !== 'production') {
                    setTokenValue('123qazwsxedc456');
                }
            }
        } catch (error) {
            console.error('测试token失败:', error);
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
                        onChange={(value) => setTokenValue(value)}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">认证Token</label>
                        <Input
                            value={captcha}
                            onChange={(value) => setCaptcha(value)}
                            placeholder="请输入验证码"
                        />
                    </div>
                    <div className="flex items-end pb-3">
                        <div
                            style={{
                                backgroundColor: '#ffffff',
                                padding: '2px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                border: '1px solid var(--semi-color-border)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <img
                                src={captchaImage}
                                alt="验证码"
                                className="w-36 h-10 cursor-pointer"
                                onClick={generateCaptcha}
                                style={{ borderRadius: '2px', cursor: 'pointer' }}
                                title="点击刷新验证码"
                            />
                        </div>
                    </div>
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