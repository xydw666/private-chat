/**
 * ============================================
 * Storage - 数据持久化层
 * 基于 localStorage，提供结构化的数据读写
 * 所有数据都存在本地，完全私密
 * ============================================
 */
const Storage = (function () {
    const PREFIX = "privatechat_";

    const KEYS = {
        MESSAGES: PREFIX + "messages",
        CARDS: PREFIX + "cards",
        CARD_GROUPS: PREFIX + "card_groups",  // 字卡分组
        SETTINGS: PREFIX + "settings",
        META: PREFIX + "meta",
        EMOJIS: PREFIX + "emojis",  // 自定义表情
    };

    // 默认设置
    const DEFAULT_SETTINGS = {
        userName: "我",
        userAvatar: "",          // 用户头像文字（留空则取名字首字）
        userAvatarImage: "",     // 用户头像图片 dataURL（优先于文字）
        taName: "TA",
        taAvatar: "",            // TA头像文字（留空则取名字首字）
        taAvatarImage: "",       // TA头像图片 dataURL（优先于文字）
        theme: "warm",
        background: "default",   // 聊天背景
        typingDelay: 0.8,         // TA回复延迟(秒)
        typingAnimation: true,   // 打字动画
        showTimestamp: true,     // 显示时间戳
    };

    // 默认字卡 - 让用户首次打开就能体验
    const DEFAULT_CARDS = [
        "嗯嗯，我在听",
        "哈哈哈好有趣",
        "今天也辛苦啦",
        "我也想你了",
        "早点休息吧",
        "你说得对",
        "那后来呢？",
        "真的吗！太棒了",
        "别担心，有我在",
        "晚安，做个好梦",
        "我也是这么想的",
        "好可爱啊",
        "今天过得怎么样？",
        "嗯，我知道了",
        "没关系啦，别放在心上",
    ];

    /**
     * 读取 JSON 数据
     */
    function read(key, defaultValue) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            console.error(`[Storage] 读取 ${key} 失败:`, e);
            return defaultValue;
        }
    }

    /**
     * 写入 JSON 数据
     */
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            if (e.name === "QuotaExceededError" || e.code === 22) {
                console.error("[Storage] 本地存储空间已满:", e);
                EventBus.emit(Events.STORAGE_WARNING, "本地存储空间已满，建议导出备份后清理旧消息");
            } else {
                console.error(`[Storage] 写入 ${key} 失败:`, e);
            }
            return false;
        }
    }

    /**
     * 生成唯一ID
     */
    function generateId(prefix) {
        return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 6);
    }

    // ========== 消息读写 ==========
    function getMessages() {
        return read(KEYS.MESSAGES, []);
    }

    function saveMessages(messages) {
        return write(KEYS.MESSAGES, messages);
    }

    function addMessage(message) {
        const messages = getMessages();
        messages.push(message);
        saveMessages(messages);
        return message;
    }

    function clearMessages() {
        saveMessages([]);
    }

    // ========== 字卡读写 ==========
    function getCards() {
        const cards = read(KEYS.CARDS, null);
        if (cards === null) {
            // 首次使用，写入默认字卡
            const initial = DEFAULT_CARDS.map((text) => ({
                id: generateId("card"),
                text: text,
                group: "default",
                createdAt: Date.now(),
                useCount: 0,
            }));
            write(KEYS.CARDS, initial);
            return initial;
        }
        return cards;
    }

    function saveCards(cards) {
        return write(KEYS.CARDS, cards);
    }

    // ========== 字卡分组读写 ==========
    function getCardGroups() {
        return read(KEYS.CARD_GROUPS, []);
    }

    function saveCardGroups(groups) {
        return write(KEYS.CARD_GROUPS, groups);
    }

    // ========== 设置读写 ==========
    function getSettings() {
        const saved = read(KEYS.SETTINGS, {});
        return Object.assign({}, DEFAULT_SETTINGS, saved);
    }

    function saveSettings(settings) {
        const current = getSettings();
        const merged = Object.assign({}, current, settings);
        write(KEYS.SETTINGS, merged);
        return merged;
    }

    function getSetting(key) {
        return getSettings()[key];
    }

    function setSetting(key, value) {
        const settings = {};
        settings[key] = value;
        return saveSettings(settings);
    }

    // ========== 元数据 ==========
    function getMeta() {
        return read(KEYS.META, {
            firstUseDate: Date.now(),
            version: 1,
        });
    }

    function saveMeta(meta) {
        const current = getMeta();
        write(KEYS.META, Object.assign({}, current, meta));
    }

    // ========== 导入导出 ==========
    function exportAll() {
        return {
            messages: getMessages(),
            cards: getCards(),
            cardGroups: getCardGroups(),
            settings: getSettings(),
            meta: getMeta(),
            emojis: getEmojis(),
            exportDate: Date.now(),
            version: 3,
        };
    }

    function importAll(data) {
        if (!data || typeof data !== "object") return false;
        if (data.messages) saveMessages(data.messages);
        if (data.cards) saveCards(data.cards);
        if (data.cardGroups) saveCardGroups(data.cardGroups);
        if (data.settings) saveSettings(data.settings);
        if (data.meta) saveMeta(data.meta);
        if (data.emojis) saveEmojis(data.emojis);
        return true;
    }

    // ========== 自定义表情读写 ==========
    function getEmojis() {
        return read(KEYS.EMOJIS, []);
    }

    function saveEmojis(emojis) {
        return write(KEYS.EMOJIS, emojis);
    }

    function addEmoji(emoji) {
        const emojis = getEmojis();
        emojis.push(emoji);
        saveEmojis(emojis);
        return emoji;
    }

    function removeEmoji(id) {
        const emojis = getEmojis();
        const idx = emojis.findIndex((e) => e.id === id);
        if (idx === -1) return false;
        emojis.splice(idx, 1);
        saveEmojis(emojis);
        return true;
    }

    // ========== 重置 ==========
    function resetAll() {
        localStorage.removeItem(KEYS.MESSAGES);
        localStorage.removeItem(KEYS.CARDS);
        localStorage.removeItem(KEYS.CARD_GROUPS);
        localStorage.removeItem(KEYS.SETTINGS);
        localStorage.removeItem(KEYS.META);
        localStorage.removeItem(KEYS.EMOJIS);
    }

    return {
        generateId,
        getMessages, saveMessages, addMessage, clearMessages,
        getCards, saveCards,
        getCardGroups, saveCardGroups,
        getSettings, saveSettings, getSetting, setSetting,
        getMeta, saveMeta,
        getEmojis, saveEmojis, addEmoji, removeEmoji,
        exportAll, importAll, resetAll,
        DEFAULT_CARDS, DEFAULT_SETTINGS,
    };
})();
