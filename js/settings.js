/**
 * ============================================
 * Settings - 设置管理模块
 * 管理用户名、TA名、头像、主题、背景、聊天行为等设置
 * ============================================
 */
const Settings = (function () {
    let settings = {};

    /**
     * 初始化
     */
    function init() {
        settings = Storage.getSettings();
        applyTheme(settings.theme);
        applyBackground(settings.background || "default");
    }

    /**
     * 获取全部设置
     */
    function get() {
        return Object.assign({}, settings);
    }

    /**
     * 获取单项设置
     */
    function getOne(key) {
        return settings[key];
    }

    /**
     * 更新设置
     */
    function set(key, value) {
        settings[key] = value;
        Storage.saveSettings(settings);
        EventBus.emit(Events.SETTING_CHANGED, { key, value });

        // 主题变更
        if (key === "theme") {
            applyTheme(value);
            EventBus.emit(Events.THEME_CHANGED, value);
        }

        // 背景变更
        if (key === "background") {
            applyBackground(value);
        }

        return value;
    }

    /**
     * 应用主题
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
    }

    /**
     * 应用聊天背景
     */
    function applyBackground(bg) {
        document.documentElement.setAttribute("data-bg", bg || "default");
    }

    /**
     * 批量更新
     */
    function update(newSettings) {
        Object.keys(newSettings).forEach((key) => {
            set(key, newSettings[key]);
        });
    }

    return {
        init, get, getOne, set, update, applyTheme, applyBackground,
    };
})();
