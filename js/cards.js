/**
 * ============================================
 * CardManager - 字卡管理模块
 * 负责 TA 回复字卡的增删改查、随机抽取
 * ============================================
 */
const CardManager = (function () {
    let cards = [];
    let lastDrawnId = null; // 记录上次抽取的字卡ID，防止连续重复

    /**
     * 初始化 - 加载字卡数据
     */
    function init() {
        cards = Storage.getCards();
        lastDrawnId = null;
        EventBus.emit(Events.CARDS_IMPORTED, cards);
    }

    /**
     * 获取所有字卡
     */
    function getAll() {
        return cards;
    }

    /**
     * 获取字卡数量
     */
    function count() {
        return cards.length;
    }

    /**
     * 添加单张字卡
     */
    function add(text) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        // 避免重复添加完全相同的字卡
        if (cards.some((c) => c.text === trimmed)) {
            return null;
        }

        const card = {
            id: Storage.generateId("card"),
            text: trimmed,
            createdAt: Date.now(),
            useCount: 0,
        };
        cards.push(card);
        Storage.saveCards(cards);
        EventBus.emit(Events.CARD_ADDED, card);
        return card;
    }

    /**
     * 批量添加字卡（支持多行文本，每行一张）
     */
    function addBatch(text) {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const added = [];
        lines.forEach((line) => {
            const card = add(line);
            if (card) added.push(card);
        });
        return added;
    }

    /**
     * 更新字卡内容
     */
    function update(id, newText) {
        const trimmed = newText.trim();
        if (!trimmed) return false;
        const card = cards.find((c) => c.id === id);
        if (!card) return false;
        card.text = trimmed;
        Storage.saveCards(cards);
        EventBus.emit(Events.CARD_UPDATED, card);
        return true;
    }

    /**
     * 删除字卡
     */
    function remove(id) {
        const idx = cards.findIndex((c) => c.id === id);
        if (idx === -1) return false;
        const removed = cards.splice(idx, 1)[0];
        Storage.saveCards(cards);
        EventBus.emit(Events.CARD_DELETED, removed);
        return true;
    }

    /**
     * 搜索字卡
     */
    function search(query) {
        if (!query || !query.trim()) return cards;
        const q = query.trim().toLowerCase();
        return cards.filter((c) => c.text.toLowerCase().includes(q));
    }

    /**
     * 随机抽取一张字卡（核心机制）
     * 当字卡数量 >= 2 时，避免连续两次抽到同一张
     * @returns {object|null} 被抽中的字卡对象，包含 text 字段
     */
    function drawRandom() {
        if (cards.length === 0) return null;

        let idx;
        if (cards.length >= 2 && lastDrawnId) {
            // 有2张以上时，避免连续抽到同一张
            do {
                idx = Math.floor(Math.random() * cards.length);
            } while (cards[idx].id === lastDrawnId);
        } else {
            idx = Math.floor(Math.random() * cards.length);
        }

        const card = cards[idx];
        lastDrawnId = card.id;
        // 记录使用次数
        card.useCount = (card.useCount || 0) + 1;
        Storage.saveCards(cards);
        return card;
    }

    /**
     * 导入字卡（合并，不覆盖已有）
     */
    function importCards(newCards) {
        if (!Array.isArray(newCards)) return 0;
        let count = 0;
        newCards.forEach((c) => {
            if (c.text && !cards.some((existing) => existing.text === c.text)) {
                cards.push({
                    id: Storage.generateId("card"),
                    text: c.text,
                    createdAt: c.createdAt || Date.now(),
                    useCount: 0,
                });
                count++;
            }
        });
        Storage.saveCards(cards);
        EventBus.emit(Events.CARDS_IMPORTED, cards);
        return count;
    }

    return {
        init, getAll, count, add, addBatch, update, remove,
        drawRandom, importCards, search,
    };
})();
