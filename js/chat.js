/**
 * ============================================
 * Chat - 聊天核心模块
 * 处理消息收发、TA字卡回复机制、打字动画
 * ============================================
 */
const Chat = (function () {
    let messages = [];
    let isTaTyping = false;
    let typingTimer = null;

    /**
     * 初始化
     */
    function init() {
        messages = Storage.getMessages();
    }

    /**
     * 获取所有消息
     */
    function getAll() {
        return messages;
    }

    /**
     * 获取消息数量
     */
    function count() {
        return messages.length;
    }

    /**
     * 用户发送消息
     * @param {string} text - 消息文本
     * @returns {object} 用户消息对象
     */
    function sendUserMessage(text) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        const message = {
            id: Storage.generateId("msg"),
            sender: "user",
            text: trimmed,
            timestamp: Date.now(),
        };
        messages.push(message);
        Storage.saveMessages(messages);
        EventBus.emit(Events.MESSAGE_SENT, message);

        // 触发 TA 回复
        _triggerTaReply();

        return message;
    }

    /**
     * 触发 TA 回复 - 核心机制
     * 从字卡库随机抽取一张字卡作为回复
     * 打字延迟 = 基础延迟 + 文字长度因素 + 随机波动
     */
    function _triggerTaReply() {
        const settings = Settings.get();
        const baseDelaySec = settings.typingDelay || 0.8;

        // 先抽取字卡（提前抽取以便计算自然延迟）
        const card = CardManager.drawRandom();
        if (!card) {
            // 字卡库为空，TA 不回复（静默处理，不打扰用户）
            return;
        }

        // 根据字卡文字长度计算自然打字延迟
        // 每个字约 0.08 秒，加上基础延迟和随机波动
        const textLength = card.text.length;
        const lengthFactor = Math.min(textLength * 0.08, 2.0); // 最多加 2 秒
        const jitter = Math.random() * 0.4; // 0-0.4 秒随机波动
        const totalDelay = (baseDelaySec + lengthFactor + jitter) * 1000; // 转为毫秒

        // 显示打字动画
        if (settings.typingAnimation) {
            isTaTyping = true;
            EventBus.emit(Events.TA_TYPING);
        }

        // 延迟后回复
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            _sendTaReply(card);
        }, totalDelay);
    }

    /**
     * 发送 TA 的回复
     * @param {object} card - 已抽取的字卡（可选，若未传则现场抽取）
     */
    function _sendTaReply(card) {
        isTaTyping = false;
        EventBus.emit(Events.TA_IDLE);

        // 如果没有预抽取，现场抽取
        if (!card) {
            card = CardManager.drawRandom();
        }

        if (!card) {
            // 字卡库为空，不回复
            EventBus.emit(Events.MESSAGE_RECEIVED, null);
            return;
        }

        const message = {
            id: Storage.generateId("msg"),
            sender: "ta",
            text: card.text,
            timestamp: Date.now(),
            cardId: card.id,
        };
        messages.push(message);
        Storage.saveMessages(messages);
        EventBus.emit(Events.MESSAGE_RECEIVED, message);
    }

    /**
     * 清空所有消息
     */
    function clearAll() {
        messages = [];
        Storage.clearMessages();
        EventBus.emit(Events.MESSAGE_CLEARED);
    }

    /**
     * TA 是否正在打字
     */
    function getIsTyping() {
        return isTaTyping;
    }

    /**
     * 导入消息（覆盖）
     */
    function importMessages(importedMessages) {
        if (!Array.isArray(importedMessages)) return false;
        messages = importedMessages;
        Storage.saveMessages(messages);
        // 重新渲染所有消息（不分 sender 统一处理）
        EventBus.emit(Events.MESSAGE_CLEARED);
        return true;
    }

    /**
     * 获取对话天数
     */
    function getChatDays() {
        if (messages.length === 0) return 0;
        const meta = Storage.getMeta();
        const firstDate = meta.firstUseDate || Date.now();
        const diffMs = Date.now() - firstDate;
        return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
        init, getAll, count, sendUserMessage, clearAll,
        getIsTyping, importMessages, getChatDays,
    };
})();
