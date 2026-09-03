/**
 * ============================================
 * CardManager - 字卡管理模块
 * 负责 TA 回复字卡的增删改查、随机抽取、分组管理
 * ============================================
 */
const CardManager = (function () {
    let cards = [];
    let groups = [];
    let lastDrawnId = null; // 记录上次抽取的字卡ID，防止连续重复
    let activeGroup = "all"; // 当前筛选的分组

    /**
     * 初始化 - 加载字卡数据
     */
    function init() {
        cards = Storage.getCards();
        groups = Storage.getCardGroups();
        // 兼容旧数据：为没有 group 的字卡分配默认分组
        cards.forEach((c) => {
            if (!c.group) c.group = "default";
        });
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

    // ========== 分组管理 ==========

    /**
     * 获取所有分组
     */
    function getGroups() {
        return groups;
    }

    /**
     * 添加分组
     */
    function addGroup(name) {
        const trimmed = name.trim();
        if (!trimmed) return null;
        if (groups.some((g) => g.name === trimmed)) return null;
        const group = {
            id: Storage.generateId("group"),
            name: trimmed,
            createdAt: Date.now(),
        };
        groups.push(group);
        Storage.saveCardGroups(groups);
        return group;
    }

    /**
     * 删除分组（字卡回归默认分组）
     */
    function removeGroup(id) {
        const idx = groups.findIndex((g) => g.id === id);
        if (idx === -1) return false;
        groups.splice(idx, 1);
        // 该分组下的字卡回归默认
        cards.forEach((c) => {
            if (c.group === id) c.group = "default";
        });
        Storage.saveCardGroups(groups);
        Storage.saveCards(cards);
        return true;
    }

    /**
     * 重命名分组
     */
    function renameGroup(id, newName) {
        const group = groups.find((g) => g.id === id);
        if (!group) return false;
        group.name = newName.trim();
        Storage.saveCardGroups(groups);
        return true;
    }

    /**
     * 设置当前筛选分组
     */
    function setActiveGroup(groupId) {
        activeGroup = groupId;
    }

    function getActiveGroup() {
        return activeGroup;
    }

    /**
     * 移动字卡到指定分组
     */
    function moveCard(cardId, groupId) {
        const card = cards.find((c) => c.id === cardId);
        if (!card) return false;
        card.group = groupId;
        Storage.saveCards(cards);
        return true;
    }

    /**
     * 获取分组下的字卡数量
     */
    function countByGroup(groupId) {
        if (groupId === "all") return cards.length;
        if (groupId === "default") return cards.filter((c) => c.group === "default" || !c.group).length;
        return cards.filter((c) => c.group === groupId).length;
    }

    // ========== 字卡增删改查 ==========

    /**
     * 添加单张字卡
     */
    function add(text, groupId) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        // 避免重复添加完全相同的字卡
        if (cards.some((c) => c.text === trimmed)) {
            return null;
        }

        const card = {
            id: Storage.generateId("card"),
            text: trimmed,
            group: groupId || "default",
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
    function addBatch(text, groupId) {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const added = [];
        lines.forEach((line) => {
            const card = add(line, groupId);
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
     * 搜索字卡（同时支持文字搜索和分组筛选）
     */
    function search(query) {
        let result = cards;

        // 分组筛选
        if (activeGroup && activeGroup !== "all") {
            if (activeGroup === "default") {
                result = result.filter((c) => c.group === "default" || !c.group);
            } else {
                result = result.filter((c) => c.group === activeGroup);
            }
        }

        // 文字搜索
        if (query && query.trim()) {
            const q = query.trim().toLowerCase();
            result = result.filter((c) => c.text.toLowerCase().includes(q));
        }

        return result;
    }

    /**
     * 随机抽取一张字卡（核心机制）
     * 当字卡数量 >= 2 时，避免连续两次抽到同一张
     * 如果设置了分组筛选且不是 all，则只从该分组抽取
     * @returns {object|null} 被抽中的字卡对象，包含 text 字段
     */
    function drawRandom() {
        let pool = cards;

        // 如果有分组筛选，只从该分组抽取
        if (activeGroup && activeGroup !== "all") {
            if (activeGroup === "default") {
                pool = cards.filter((c) => c.group === "default" || !c.group);
            } else {
                pool = cards.filter((c) => c.group === activeGroup);
            }
        }

        if (pool.length === 0) return null;

        let idx;
        if (pool.length >= 2 && lastDrawnId) {
            do {
                idx = Math.floor(Math.random() * pool.length);
            } while (pool[idx].id === lastDrawnId);
        } else {
            idx = Math.floor(Math.random() * pool.length);
        }

        const card = pool[idx];
        lastDrawnId = card.id;
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
                    group: c.group || "default",
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
        getGroups, addGroup, removeGroup, renameGroup,
        setActiveGroup, getActiveGroup, moveCard, countByGroup,
    };
})();
