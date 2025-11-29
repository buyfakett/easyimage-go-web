import { IconMoon } from "@douyinfe/semi-icons";
import { Button, Tooltip } from "@douyinfe/semi-ui-19";
import { useState, useEffect } from "react";

export default function SwitchThemeButton() {
    // 从 localStorage 初始化状态
    const [isDark, setIsDark] = useState<boolean>(() => {
        const savedMode = localStorage.getItem('theme-mode');
        return savedMode === 'dark';
    });

    useEffect(() => {
        // 组件加载时应用存储的主题
        const body = document.body;
        if (isDark) {
            body.setAttribute("theme-mode", "dark");
        } else {
            body.removeAttribute("theme-mode");
        }
    }, []); // 空依赖数组表示只在组件挂载时执行一次

    const changeMode = () => {
        const newMode = !isDark;
        setIsDark(newMode);

        const body = document.body;
        if (newMode) {
            body.setAttribute("theme-mode", "dark");
            localStorage.setItem('theme-mode', 'dark');
        } else {
            body.removeAttribute("theme-mode");
            localStorage.removeItem('theme-mode');
        }
    };

    const IconButtons = [
        {
            icon: <IconMoon size="extra-large"/>,
            event: () => changeMode(),
            tip: `切换到${isDark ? "亮色" : "暗色"}模式`,
        },
    ];

    // 顶部导航右侧icon按钮
    const renderIcons = () => {
        return (
            <div className="flex gap-2 mr-4">
                {IconButtons.map((item, index) => {
                    return item?.tip ? (
                        <Tooltip content={item?.tip} key={index}>
                            <Button
                                theme="borderless"
                                icon={item.icon}
                                onClick={item.event}
                                type="tertiary"
                            />
                        </Tooltip>
                    ) : (
                        <Button
                            key={index}
                            theme="borderless"
                            icon={item.icon}
                            onClick={item.event}
                            type="tertiary"
                        />
                    );
                })}
            </div>
        );
    };

    return renderIcons();
}