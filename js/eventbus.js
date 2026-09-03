/**
 * ============================================
 * EventBus - 事件总线
 * 模块间通信的核心，所有模块通过事件解耦
 * 未来扩展新功能时，只需监听相关事件即可
 * ============================================
 */
const EventBus = (function () {
    const listeners = new Map();

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @returns {function} 取消监听的函数
     */
    function on(event, callback) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event).add(callback);
        // 返回取消监听函数，方便临时监听
        return () => off(event, callback);
    }

    /**
     * 注册一次性事件监听器（触发后自动移除）
     */
    function once(event, callback) {
        const wrapper = (...args) => {
            off(event, wrapper);
            callback(...args);
        };
        return on(event, wrapper);
    }

    /**
     * 移除事件监听器
     */
    function off(event, callback) {
        if (listeners.has(event)) {
            listeners.get(event).delete(callback);
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...any} args - 传递给监听器的参数
     */
    function emit(event, ...args) {
        if (listeners.has(event)) {
            listeners.get(event).forEach((cb) => {
                try {
                    cb(...args);
                } catch (e) {
                    console.error(`[EventBus] 事件 "${event}" 监听器出错:`, e);
                }
            });
        }
    }

    /**
     * 获取所有已注册的事件名（调试用）
     */
    function getEvents() {
        return Array.from(listeners.keys());
    }

    return { on, once, off, emit, getEvents };
})();

// ============================================
// 全局事件名常量 - 统一管理，避免拼写错误
// ============================================
const Events = {
    // 消息相关
    MESSAGE_SENT: "message:sent",       // 用户发送消息
    MESSAGE_RECEIVED: "message:received", // TA回复消息
    MESSAGE_CLEARED: "message:cleared",   // 清空消息

    // 字卡相关
    CARD_ADDED: "card:added",
    CARD_DELETED: "card:deleted",
    CARD_UPDATED: "card:updated",
    CARDS_IMPORTED: "card:imported",

    // 设置相关
    SETTING_CHANGED: "setting:changed",
    THEME_CHANGED: "theme:changed",

    // 聊天状态
    TA_TYPING: "ta:typing",
    TA_IDLE: "ta:idle",

    // 数据
    DATA_EXPORTED: "data:exported",
    DATA_IMPORTED: "data:imported",
    DATA_RESET: "data:reset",
    STORAGE_WARNING: "storage:warning", // 存储容量告警
};
