/**
 * ============================================
 * App - 主应用入口
 * 串联所有模块，管理 UI 渲染和交互
 * 微信风格消息布局 + 手机端键盘适配
 * ============================================
 */
const App = (function () {
    const dom = {};

    const EMOJIS = [
        "😀", "😄", "😁", "😊", "😍", "🥰", "😘", "🤗",
        "🤔", "🤭", "🥺", "😢", "😭", "😅", "😂", "🤣",
        "😉", "😙", "😚", "😋", "😜", "🤪", "😝", "🥳",
        "😴", "🤤", "😪", "🤐", "😶", "😐", "😳",
        "😨", "😰", "😥", "😓", "🙄", "😏", "😬", "🤥",
        "😌", "😔", "😞", "😟", "😣", "😖", "😫", "😩",
        "🥱", "❤️", "🧡", "💛", "💚", "💙", "💜",
        "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓",
        "💗", "💖", "💘", "💝", "💟", "♥️", "🌹", "🌻",
        "☀️", "🌙", "⭐", "✨", "🔥", "🌈", "☁️", "❄️",
    ];

    function init() {
        cacheDom();
        loadModules();
        bindEvents();
        renderAll();
        _initEmojiPanel();
        _initKeyboardAdapter();
        console.log("%c💖 私人字卡聊天已启动", "color: #e8917a; font-size: 14px; font-weight: bold;");
    }

    function cacheDom() {
        dom.chatBody = UI.$("#chatBody");
        dom.chatMessages = UI.$("#chatMessages");
        dom.messageInput = UI.$("#messageInput");
        dom.sendBtn = UI.$("#sendBtn");
        dom.emojiBtn = UI.$("#emojiBtn");
        dom.emojiPanel = UI.$("#emojiPanel");
        dom.emojiGrid = UI.$("#emojiGrid");
        dom.app = UI.$("#app");

        // 表情面板 - 自定义表情
        dom.emojiTabs = UI.$$(".emoji-tab");
        dom.emojiTabDefault = UI.$("#emojiTabDefault");
        dom.emojiTabCustom = UI.$("#emojiTabCustom");
        dom.customEmojiGrid = UI.$("#customEmojiGrid");
        dom.addTextEmojiBtn = UI.$("#addTextEmojiBtn");
        dom.addImageEmojiBtn = UI.$("#addImageEmojiBtn");

        dom.taName = UI.$("#taName");
        dom.taStatus = UI.$("#taStatus");

        dom.settingsBtn = UI.$("#settingsBtn");
        dom.cardMgrBtn = UI.$("#cardMgrBtn");
        dom.settingsDrawer = UI.$("#settingsDrawer");
        dom.cardDrawer = UI.$("#cardDrawer");
        dom.settingsOverlay = UI.$("#settingsOverlay");
        dom.cardOverlay = UI.$("#cardOverlay");
        dom.closeSettingsBtn = UI.$("#closeSettingsBtn");
        dom.closeCardBtn = UI.$("#closeCardBtn");

        dom.cardList = UI.$("#cardList");
        dom.cardInput = UI.$("#cardInput");
        dom.addCardBtn = UI.$("#addCardBtn");
        dom.cardSearch = UI.$("#cardSearch");
        dom.totalCards = UI.$("#totalCards");
        dom.totalMessages = UI.$("#totalMessages");
        dom.totalDays = UI.$("#totalDays");

        // 字卡批量操作
        dom.batchModeBtn = UI.$("#batchModeBtn");
        dom.batchActions = UI.$("#batchActions");
        dom.selectAllBtn = UI.$("#selectAllBtn");
        dom.deselectAllBtn = UI.$("#deselectAllBtn");
        dom.batchCount = UI.$("#batchCount");
        dom.batchDeleteBtn = UI.$("#batchDeleteBtn");
        dom.exitBatchBtn = UI.$("#exitBatchBtn");

        // 字卡分组
        dom.cardGroupSelect = UI.$("#cardGroupSelect");
        dom.cardGroupTabs = UI.$("#cardGroupTabs");
        dom.addGroupBtn = UI.$("#addGroupBtn");
        dom.cardGroupManage = UI.$("#cardGroupManage");
        dom.renameGroupBtn = UI.$("#renameGroupBtn");
        dom.deleteGroupBtn = UI.$("#deleteGroupBtn");
        dom.exitGroupManageBtn = UI.$("#exitGroupManageBtn");

        dom.userNameInput = UI.$("#userNameInput");
        dom.userAvatarInput = UI.$("#userAvatarInput");
        dom.userAvatarPreview = UI.$("#userAvatarPreview");
        dom.userAvatarUploadBtn = UI.$("#userAvatarUploadBtn");
        dom.userAvatarClearBtn = UI.$("#userAvatarClearBtn");
        dom.taNameInput = UI.$("#taNameInput");
        dom.taAvatarInput = UI.$("#taAvatarInput");
        dom.taAvatarPreview = UI.$("#taAvatarPreview");
        dom.taAvatarUploadBtn = UI.$("#taAvatarUploadBtn");
        dom.taAvatarClearBtn = UI.$("#taAvatarClearBtn");
        dom.typingDelayInput = UI.$("#typingDelayInput");
        dom.typingAnimToggle = UI.$("#typingAnimToggle");
        dom.showTimeToggle = UI.$("#showTimeToggle");
        dom.themePicker = UI.$("#themePicker");
        dom.bgSelect = UI.$("#bgSelect");

        dom.exportBtn = UI.$("#exportBtn");
        dom.importBtn = UI.$("#importBtn");
        dom.clearChatBtn = UI.$("#clearChatBtn");
        dom.resetBtn = UI.$("#resetBtn");
    }

    function loadModules() {
        Settings.init();
        CardManager.init();
        Chat.init();
    }

    // ============================================
    // 头像辅助
    // ============================================
    function _getUserAvatarText() {
        const custom = Settings.getOne("userAvatar");
        if (custom && custom.trim()) return custom.trim();
        const name = Settings.getOne("userName") || "我";
        return name.charAt(0).toUpperCase();
    }

    function _getTaAvatarText() {
        const custom = Settings.getOne("taAvatar");
        if (custom && custom.trim()) return custom.trim();
        const name = Settings.getOne("taName") || "TA";
        return name.charAt(0).toUpperCase();
    }

    function _getUserAvatarImage() {
        return Settings.getOne("userAvatarImage") || "";
    }

    function _getTaAvatarImage() {
        return Settings.getOne("taAvatarImage") || "";
    }

    /**
     * 设置头像元素内容（文字或图片）
     */
    function _setAvatarContent(avatarEl, text, imageData) {
        avatarEl.innerHTML = "";
        if (imageData) {
            const img = UI.createElement("img");
            img.src = imageData;
            img.alt = "头像";
            avatarEl.appendChild(img);
        } else {
            avatarEl.textContent = text;
        }
    }

    /**
     * 渲染气泡内容 - 支持混合文本和图片
     * 图片用 {{img}}dataURL{{/img}} 标记
     */
    function _renderBubbleContent(bubble, text) {
        bubble.innerHTML = "";
        const imgPattern = /\{\{img\}\}([\s\S]*?)\{\{\/img\}\}/g;
        let lastIndex = 0;
        let match;

        while ((match = imgPattern.exec(text)) !== null) {
            // 添加图片前的文本
            if (match.index > lastIndex) {
                const textPart = text.slice(lastIndex, match.index);
                if (textPart) {
                    const span = UI.createElement("span");
                    span.textContent = textPart;
                    bubble.appendChild(span);
                }
            }
            // 添加图片
            const img = UI.createElement("img");
            img.className = "bubble-emoji-img";
            img.src = match[1];
            img.alt = "表情";
            bubble.appendChild(img);
            lastIndex = match.index + match[0].length;
        }

        // 添加剩余文本
        if (lastIndex < text.length) {
            const remaining = text.slice(lastIndex);
            if (remaining) {
                const span = UI.createElement("span");
                span.textContent = remaining;
                bubble.appendChild(span);
            }
        }

        // 如果没有内容（纯图片被删除等情况）
        if (bubble.childNodes.length === 0) {
            bubble.textContent = text;
        }
    }

    // ============================================
    // 渲染：聊天消息
    // ============================================
    function renderMessages() {
        const messages = Chat.getAll();
        dom.chatMessages.innerHTML = "";

        if (messages.length === 0) {
            _renderWelcome();
            return;
        }

        let lastDateKey = null;
        const showTime = Settings.getOne("showTimestamp");
        const userAvatarText = _getUserAvatarText();
        const taAvatarText = _getTaAvatarText();
        const userAvatarImage = _getUserAvatarImage();
        const taAvatarImage = _getTaAvatarImage();

        messages.forEach((msg, i) => {
            const dateKey = UI.getDateKey(msg.timestamp);
            if (dateKey !== lastDateKey) {
                lastDateKey = dateKey;
                const sep = UI.createElement("div", "date-separator");
                sep.textContent = UI.formatDateSeparator(msg.timestamp);
                dom.chatMessages.appendChild(sep);
            }

            const avatarText = msg.sender === "user" ? userAvatarText : taAvatarText;
            const avatarImage = msg.sender === "user" ? userAvatarImage : taAvatarImage;
            const prevMsg = i > 0 ? messages[i - 1] : null;
            dom.chatMessages.appendChild(_createMessageElement(msg, showTime, avatarText, avatarImage, prevMsg));
        });

        UI.scrollToBottom(false);
    }

    function _renderWelcome() {
        const taName = Settings.getOne("taName") || "TA";
        const welcome = UI.createElement("div", "welcome-msg");
        welcome.innerHTML = `
            <div class="welcome-icon">💬</div>
            <p>和 <strong>${UI.escapeHtml(taName)}</strong> 的私人对话空间<br>
            发送一条消息，开始你们的对话吧</p>
        `;
        dom.chatMessages.appendChild(welcome);
    }

    /**
     * 创建单条消息元素 - 微信风格
     * 头像 + 气泡（带尖角），用户在右，TA在左
     * 连续同方向消息（60秒内）只显示第一个头像
     */
    function _createMessageElement(msg, showTime, avatarText, avatarImage, prevMsg) {
        const row = UI.createElement("div", `message-row ${msg.sender}`);

        // 判断是否为连续消息（同一发送者且60秒内）
        const isContinuous = prevMsg &&
            prevMsg.sender === msg.sender &&
            (msg.timestamp - prevMsg.timestamp) < 60000;

        // 头像（连续消息时隐藏但保留占位）
        const avatar = UI.createElement("div", "msg-avatar");
        if (isContinuous) {
            avatar.classList.add("avatar-hidden");
        } else {
            _setAvatarContent(avatar, avatarText, avatarImage);
        }
        row.appendChild(avatar);

        // 气泡容器
        const wrapper = UI.createElement("div", "bubble-wrapper");

        const bubble = UI.createElement("div", "bubble");
        _renderBubbleContent(bubble, msg.text);
        wrapper.appendChild(bubble);

        // 连续消息不显示时间戳（减少视觉噪音）
        if (showTime && !isContinuous) {
            const time = UI.createElement("span", "msg-time");
            time.textContent = UI.formatTime(msg.timestamp);
            wrapper.appendChild(time);
        }

        row.appendChild(wrapper);
        return row;
    }

    /**
     * 追加单条消息（不重新渲染全部）
     */
    function _appendMessage(msg) {
        const welcome = dom.chatMessages.querySelector(".welcome-msg");
        if (welcome) welcome.remove();

        const showTime = Settings.getOne("showTimestamp");
        const avatarText = msg.sender === "user" ? _getUserAvatarText() : _getTaAvatarText();
        const avatarImage = msg.sender === "user" ? _getUserAvatarImage() : _getTaAvatarImage();

        const messages = Chat.getAll();
        const prevMsg = messages.length > 1 ? messages[messages.length - 2] : null;
        if (!prevMsg || UI.getDateKey(prevMsg.timestamp) !== UI.getDateKey(msg.timestamp)) {
            const sep = UI.createElement("div", "date-separator");
            sep.textContent = UI.formatDateSeparator(msg.timestamp);
            dom.chatMessages.appendChild(sep);
        }

        dom.chatMessages.appendChild(_createMessageElement(msg, showTime, avatarText, avatarImage, prevMsg));
        UI.scrollToBottom(true);
    }

    /**
     * 渲染打字指示器（也带TA头像）
     */
    function _renderTypingIndicator() {
        _removeTypingIndicator();
        const row = UI.createElement("div", "message-row ta");
        row.id = "typingRow";

        const avatar = UI.createElement("div", "msg-avatar");
        _setAvatarContent(avatar, _getTaAvatarText(), _getTaAvatarImage());
        row.appendChild(avatar);

        const wrapper = UI.createElement("div", "bubble-wrapper");
        const bubble = UI.createElement("div", "bubble");
        bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        wrapper.appendChild(bubble);
        row.appendChild(wrapper);

        dom.chatMessages.appendChild(row);
        UI.scrollToBottom(true);
    }

    function _removeTypingIndicator() {
        const existing = UI.$("#typingRow");
        if (existing) existing.remove();
    }

    // ============================================
    // 渲染：字卡管理（含批量模式）
    // ============================================
    let batchMode = false;
    let selectedIds = new Set();

    function renderCardList() {
        const query = dom.cardSearch.value;
        const cards = CardManager.search(query);
        dom.cardList.innerHTML = "";

        if (cards.length === 0) {
            const empty = UI.createElement("div", "card-empty");
            const activeGroup = CardManager.getActiveGroup();
            if (query) {
                empty.textContent = "没有找到匹配的字卡";
            } else if (activeGroup !== "all") {
                empty.textContent = "该分组下还没有字卡";
            } else {
                empty.textContent = "还没有字卡，添加一些吧";
            }
            dom.cardList.appendChild(empty);
        } else {
            cards.forEach((card) => {
                dom.cardList.appendChild(_createCardElement(card));
            });
        }

        _updateBatchUI();
        _updateStats();
    }

    function _createCardElement(card) {
        const item = UI.createElement("div", "card-item");
        item.dataset.id = card.id;

        if (batchMode && selectedIds.has(card.id)) {
            item.classList.add("selected");
        }

        if (batchMode) {
            // 批量模式：显示复选框，点击切换选中
            const checkbox = UI.createElement("div", "card-checkbox");
            if (selectedIds.has(card.id)) checkbox.classList.add("checked");
            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
                _toggleSelect(card.id);
            });
            item.appendChild(checkbox);

            item.addEventListener("click", () => _toggleSelect(card.id));
        }

        const text = UI.createElement("div", "card-text");
        text.textContent = card.text;

        if (!batchMode) {
            const actions = UI.createElement("div", "card-actions");

            const editBtn = UI.createElement("button", "icon-btn");
            editBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
            editBtn.title = "编辑";
            editBtn.addEventListener("click", (e) => { e.stopPropagation(); _editCard(card); });

            const delBtn = UI.createElement("button", "icon-btn");
            delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            delBtn.title = "删除";
            delBtn.addEventListener("click", (e) => { e.stopPropagation(); _deleteCard(card); });

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            item.appendChild(text);
            item.appendChild(actions);
        } else {
            item.appendChild(text);
        }
        return item;
    }

    function _toggleSelect(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id);
        } else {
            selectedIds.add(id);
        }
        renderCardList();
    }

    function _updateBatchUI() {
        if (batchMode) {
            dom.batchActions.style.display = "flex";
            dom.batchModeBtn.style.display = "none";
            dom.batchCount.textContent = `已选 ${selectedIds.size} 张`;
        } else {
            dom.batchActions.style.display = "none";
            dom.batchModeBtn.style.display = "";
            selectedIds.clear();
        }
    }

    function _enterBatchMode() {
        batchMode = true;
        selectedIds.clear();
        renderCardList();
    }

    function _exitBatchMode() {
        batchMode = false;
        selectedIds.clear();
        renderCardList();
    }

    function _selectAllCards() {
        const cards = CardManager.search(dom.cardSearch.value);
        cards.forEach((c) => selectedIds.add(c.id));
        renderCardList();
    }

    function _deselectAllCards() {
        selectedIds.clear();
        renderCardList();
    }

    async function _batchDeleteCards() {
        if (selectedIds.size === 0) {
            UI.toast("请先选择字卡");
            return;
        }
        const confirmed = await UI.confirm(`确定删除选中的 ${selectedIds.size} 张字卡？`);
        if (confirmed) {
            let count = 0;
            selectedIds.forEach((id) => {
                if (CardManager.remove(id)) count++;
            });
            UI.toast(`已删除 ${count} 张字卡`);
            _renderGroupTabs();
            _exitBatchMode();
        }
    }

    function _editCard(card) {
        // 构建分组选项文本
        const groups = CardManager.getGroups();
        let groupOptions = "0. 默认分组";
        groups.forEach((g, i) => {
            groupOptions += `\n${i + 1}. ${g.name}`;
        });

        const newText = prompt("编辑字卡内容：", card.text);
        if (newText !== null && newText.trim() && newText.trim() !== card.text) {
            if (CardManager.update(card.id, newText)) {
                UI.toast("字卡已更新");
                renderCardList();
            }
        }

        // 提供移动分组选项
        const moveChoice = prompt(
            `移动"${card.text.substring(0, 20)}..."到其他分组？\n输入序号选择分组（留空跳过）：\n${groupOptions}`,
            ""
        );
        if (moveChoice !== null && moveChoice.trim()) {
            const idx = parseInt(moveChoice.trim());
            let targetGroupId;
            if (idx === 0) {
                targetGroupId = "default";
            } else if (idx > 0 && idx <= groups.length) {
                targetGroupId = groups[idx - 1].id;
            }
            if (targetGroupId && targetGroupId !== card.group) {
                CardManager.moveCard(card.id, targetGroupId);
                _renderGroupTabs();
                renderCardList();
                UI.toast("已移动到新分组");
            }
        }
    }

    async function _deleteCard(card) {
        const confirmed = await UI.confirm(`删除字卡"${card.text}"？`);
        if (confirmed) {
            CardManager.remove(card.id);
            UI.toast("已删除");
            _renderGroupTabs();
            renderCardList();
        }
    }

    function _updateStats() {
        dom.totalCards.textContent = CardManager.count();
        dom.totalMessages.textContent = Chat.count();
        dom.totalDays.textContent = Chat.getChatDays();
    }

    // ============================================
    // 渲染：分组标签
    // ============================================
    function _renderGroupTabs() {
        const activeGroup = CardManager.getActiveGroup();
        const groups = CardManager.getGroups();
        const tabs = dom.cardGroupTabs;
        tabs.innerHTML = "";

        // "全部" 标签
        const allTab = UI.createElement("button", "group-tab");
        allTab.textContent = `全部 (${CardManager.countByGroup("all")})`;
        allTab.dataset.group = "all";
        if (activeGroup === "all") allTab.classList.add("active");
        tabs.appendChild(allTab);

        // "默认" 标签
        const defaultTab = UI.createElement("button", "group-tab");
        defaultTab.textContent = `默认 (${CardManager.countByGroup("default")})`;
        defaultTab.dataset.group = "default";
        if (activeGroup === "default") defaultTab.classList.add("active");
        tabs.appendChild(defaultTab);

        // 自定义分组
        groups.forEach((g) => {
            const tab = UI.createElement("button", "group-tab");
            tab.textContent = `${g.name} (${CardManager.countByGroup(g.id)})`;
            tab.dataset.group = g.id;
            if (activeGroup === g.id) tab.classList.add("active");
            tabs.appendChild(tab);
        });

        // 标签点击事件
        tabs.querySelectorAll(".group-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                const groupId = tab.dataset.group;
                CardManager.setActiveGroup(groupId);
                _renderGroupTabs();
                renderCardList();
                _updateGroupManageUI();
            });
        });

        _updateGroupSelect();
    }

    /**
     * 更新添加字卡时的分组选择下拉框
     */
    function _updateGroupSelect() {
        const select = dom.cardGroupSelect;
        const currentVal = select.value || "default";
        select.innerHTML = "";

        const defaultOpt = UI.createElement("option");
        defaultOpt.value = "default";
        defaultOpt.textContent = "默认分组";
        select.appendChild(defaultOpt);

        CardManager.getGroups().forEach((g) => {
            const opt = UI.createElement("option");
            opt.value = g.id;
            opt.textContent = g.name;
            select.appendChild(opt);
        });

        // 恢复之前的选择
        if ([...select.options].some((o) => o.value === currentVal)) {
            select.value = currentVal;
        } else {
            select.value = "default";
        }
    }

    function _updateGroupManageUI() {
        const activeGroup = CardManager.getActiveGroup();
        // 只在选中自定义分组时显示管理按钮
        if (activeGroup !== "all" && activeGroup !== "default") {
            dom.cardGroupManage.style.display = "flex";
        } else {
            dom.cardGroupManage.style.display = "none";
        }
    }

    function _addGroup() {
        const name = prompt("输入分组名称：");
        if (!name || !name.trim()) return;
        const group = CardManager.addGroup(name);
        if (group) {
            UI.toast("分组已创建");
            _renderGroupTabs();
        } else {
            UI.toast("分组名已存在");
        }
    }

    async function _deleteGroup() {
        const activeGroup = CardManager.getActiveGroup();
        const groups = CardManager.getGroups();
        const group = groups.find((g) => g.id === activeGroup);
        if (!group) return;
        const confirmed = await UI.confirm(`删除分组"${group.name}"？\n该分组下的字卡将移至默认分组。`);
        if (confirmed) {
            CardManager.removeGroup(activeGroup);
            CardManager.setActiveGroup("all");
            _renderGroupTabs();
            renderCardList();
            _updateGroupManageUI();
            UI.toast("分组已删除");
        }
    }

    function _renameGroup() {
        const activeGroup = CardManager.getActiveGroup();
        const groups = CardManager.getGroups();
        const group = groups.find((g) => g.id === activeGroup);
        if (!group) return;
        const newName = prompt("输入新的分组名称：", group.name);
        if (newName && newName.trim() && newName.trim() !== group.name) {
            if (CardManager.renameGroup(activeGroup, newName)) {
                UI.toast("已重命名");
                _renderGroupTabs();
            }
        }
    }

    // ============================================
    // 渲染：设置面板
    // ============================================
    function renderSettings() {
        const s = Settings.get();
        dom.userNameInput.value = s.userName || "";
        dom.userAvatarInput.value = s.userAvatar || "";
        dom.taNameInput.value = s.taName || "";
        dom.taAvatarInput.value = s.taAvatar || "";
        dom.typingDelayInput.value = s.typingDelay;
        dom.typingAnimToggle.checked = s.typingAnimation;
        dom.showTimeToggle.checked = s.showTimestamp;
        dom.bgSelect.value = s.background || "default";

        // 头像预览
        _updateAvatarPreview("user");
        _updateAvatarPreview("ta");

        UI.$$(".theme-dot").forEach((dot) => {
            dot.classList.toggle("active", dot.dataset.theme === s.theme);
        });
    }

    /**
     * 更新头像预览
     * type: "user" | "ta"
     */
    function _updateAvatarPreview(type) {
        const preview = type === "user" ? dom.userAvatarPreview : dom.taAvatarPreview;
        const clearBtn = type === "user" ? dom.userAvatarClearBtn : dom.taAvatarClearBtn;
        const imageData = type === "user" ? _getUserAvatarImage() : _getTaAvatarImage();
        const text = type === "user" ? _getUserAvatarText() : _getTaAvatarText();

        preview.innerHTML = "";
        if (imageData) {
            const img = UI.createElement("img");
            img.src = imageData;
            img.alt = "头像预览";
            preview.appendChild(img);
            clearBtn.style.display = "";
        } else {
            preview.textContent = text;
            clearBtn.style.display = "none";
        }

        // 预览背景色跟随身份
        preview.style.background = type === "user"
            ? "var(--avatar-user)"
            : "var(--avatar-ta)";
        if (imageData) {
            preview.style.background = "none";
        }
    }

    function renderHeader() {
        const taName = Settings.getOne("taName") || "TA";
        dom.taName.textContent = taName;
    }

    function renderAll() {
        renderHeader();
        renderMessages();
        renderCardList();
        _renderGroupTabs();
        renderSettings();
    }

    // ============================================
    // 抽屉管理
    // ============================================
    function openDrawer(drawer, overlay) {
        drawer.classList.add("show");
        overlay.classList.add("show");
    }

    function closeDrawer(drawer, overlay) {
        drawer.classList.remove("show");
        overlay.classList.remove("show");
    }

    function closeAllDrawers() {
        closeDrawer(dom.cardDrawer, dom.cardOverlay);
        closeDrawer(dom.settingsDrawer, dom.settingsOverlay);
    }

    // ============================================
    // 表情面板（含自定义表情、图片转表情）
    // ============================================
    function _initEmojiPanel() {
        // 默认表情
        const grid = dom.emojiGrid;
        EMOJIS.forEach((emoji) => {
            const btn = UI.createElement("button");
            btn.textContent = emoji;
            btn.addEventListener("click", () => _insertText(emoji));
            grid.appendChild(btn);
        });

        // 标签页切换
        dom.emojiTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                dom.emojiTabs.forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                const isCustom = tab.dataset.tab === "custom";
                dom.emojiTabDefault.style.display = isCustom ? "none" : "";
                dom.emojiTabCustom.style.display = isCustom ? "" : "none";
                if (isCustom) _renderCustomEmojis();
            });
        });

        // 添加文字表情
        dom.addTextEmojiBtn.addEventListener("click", () => {
            const text = prompt("输入自定义表情（文字/emoji）：");
            if (text && text.trim()) {
                Storage.addEmoji({
                    id: Storage.generateId("emoji"),
                    type: "text",
                    content: text.trim(),
                });
                _renderCustomEmojis();
                UI.toast("已添加");
            }
        });

        // 添加图片表情（图片转表情）
        dom.addImageEmojiBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                    UI.toast("图片需小于 2MB");
                    return;
                }
                try {
                    const dataUrl = await _compressImage(file, 48);
                    Storage.addEmoji({
                        id: Storage.generateId("emoji"),
                        type: "image",
                        content: dataUrl,
                    });
                    _renderCustomEmojis();
                    UI.toast("图片表情已添加");
                } catch (err) {
                    UI.toast("图片处理失败");
                }
            });
            input.click();
        });
    }

    /**
     * 渲染自定义表情列表
     */
    function _renderCustomEmojis() {
        const grid = dom.customEmojiGrid;
        grid.innerHTML = "";
        const emojis = Storage.getEmojis();

        if (emojis.length === 0) {
            const empty = UI.createElement("div", "custom-emoji-empty");
            empty.textContent = "还没有自定义表情\n点击上方按钮添加";
            empty.style.whiteSpace = "pre-line";
            grid.appendChild(empty);
            return;
        }

        emojis.forEach((emoji) => {
            if (emoji.type === "image") {
                // 图片表情
                const btn = UI.createElement("button", "emoji-img-btn");
                const img = UI.createElement("img");
                img.src = emoji.content;
                img.alt = "自定义表情";
                btn.appendChild(img);

                // 删除按钮
                const delBtn = UI.createElement("button", "emoji-del");
                delBtn.textContent = "×";
                delBtn.title = "删除";
                delBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    Storage.removeEmoji(emoji.id);
                    _renderCustomEmojis();
                    UI.toast("已删除");
                });
                btn.appendChild(delBtn);

                btn.addEventListener("click", () => _insertText(emoji.content, true));
                grid.appendChild(btn);
            } else {
                // 文字表情
                const btn = UI.createElement("button", "emoji-img-btn emoji-text-btn");
                btn.textContent = emoji.content;

                const delBtn = UI.createElement("button", "emoji-del");
                delBtn.textContent = "×";
                delBtn.title = "删除";
                delBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    Storage.removeEmoji(emoji.id);
                    _renderCustomEmojis();
                    UI.toast("已删除");
                });
                btn.appendChild(delBtn);

                btn.addEventListener("click", () => _insertText(emoji.content));
                grid.appendChild(btn);
            }
        });
    }

    /**
     * 处理头像图片上传
     * type: "user" | "ta"
     */
    function _handleAvatarUpload(type) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                UI.toast("图片需小于 5MB");
                return;
            }
            try {
                const dataUrl = await _compressImage(file, 128);
                const key = type === "user" ? "userAvatarImage" : "taAvatarImage";
                Settings.set(key, dataUrl);
                _updateAvatarPreview(type);
                renderMessages();
                UI.toast("头像图片已设置");
            } catch (err) {
                UI.toast("图片处理失败");
            }
        });
        input.click();
    }

    /**
     * 压缩图片为 dataURL（用于存储为表情）
     */
    function _compressImage(file, maxSize) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let { width, height } = img;
                    // 等比缩放到 maxSize
                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round(height * maxSize / width);
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round(width * maxSize / height);
                            height = maxSize;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 向输入框插入文本或图片
     * 图片用短占位符 [图] 显示在输入框，实际 dataURL 暂存待发送时替换
     */
    let _pendingImages = []; // 待发送的图片 dataURL 队列

    function _insertText(content, isImage) {
        const start = dom.messageInput.selectionStart;
        const end = dom.messageInput.selectionEnd;
        const text = dom.messageInput.value;
        if (isImage) {
            // 插入短占位符到输入框，dataURL 暂存
            const placeholder = "[图]";
            _pendingImages.push(content);
            dom.messageInput.value = text.slice(0, start) + placeholder + text.slice(end);
            dom.messageInput.focus();
            dom.messageInput.selectionStart = dom.messageInput.selectionEnd = start + placeholder.length;
        } else {
            dom.messageInput.value = text.slice(0, start) + content + text.slice(end);
            dom.messageInput.focus();
            dom.messageInput.selectionStart = dom.messageInput.selectionEnd = start + content.length;
        }
        UI.autoResizeTextarea(dom.messageInput);
    }

    function toggleEmojiPanel() {
        dom.emojiPanel.classList.toggle("show");
        if (dom.emojiPanel.classList.contains("show")) {
            _renderCustomEmojis();
        }
    }

    // ============================================
    // 手机键盘适配 - 核心逻辑
    // 使用 visualViewport API 监听键盘弹出
    // ============================================
    function _initKeyboardAdapter() {
        if (window.visualViewport) {
            const vv = window.visualViewport;

            const onResize = () => {
                const offsetHeight = window.innerHeight - vv.height;
                if (offsetHeight > 50) {
                    // 键盘弹出
                    dom.app.style.height = vv.height + "px";
                    // 滚动到底部，确保消息不被遮挡
                    requestAnimationFrame(() => {
                        UI.scrollToBottom(false);
                    });
                } else {
                    // 键盘收起
                    dom.app.style.height = "";
                }
            };

            vv.addEventListener("resize", onResize);
            vv.addEventListener("scroll", onResize);
        }

        // 输入框聚焦时滚动到底部
        dom.messageInput.addEventListener("focus", () => {
            setTimeout(() => UI.scrollToBottom(false), 300);
        });

        // 防止页面整体被键盘顶上去
        window.addEventListener("resize", () => {
            if (document.activeElement === dom.messageInput) {
                setTimeout(() => UI.scrollToBottom(false), 100);
            }
        });
    }

    // ============================================
    // 字卡添加辅助
    // ============================================
    function _addCardsFromInput() {
        const text = dom.cardInput.value.trim();
        if (!text) return;
        const groupId = dom.cardGroupSelect.value || "default";
        const added = CardManager.addBatch(text, groupId);
        dom.cardInput.value = "";
        if (added.length > 0) {
            UI.toast(`添加了 ${added.length} 张字卡`);
            _renderGroupTabs();
        } else {
            UI.toast("字卡已存在或内容为空");
        }
        renderCardList();
    }

    // ============================================
    // 消息发送
    // ============================================
    function sendMessage() {
        let text = dom.messageInput.value.trim();
        if (!text) return;

        // 将 [图] 占位符替换为 {{img}}dataURL{{/img}} 标记
        let imgIdx = 0;
        text = text.replace(/\[图\]/g, () => {
            if (imgIdx < _pendingImages.length) {
                return "{{img}}" + _pendingImages[imgIdx++] + "{{/img}}";
            }
            return "";
        });
        _pendingImages = []; // 清空待发送队列

        if (!text.trim()) return;

        dom.messageInput.value = "";
        UI.autoResizeTextarea(dom.messageInput);
        dom.sendBtn.disabled = true;

        // 发送用户消息 -> TA自动从字卡库随机抽取回复
        // 字卡库为空时用户消息仍会发送，只是TA不会回复
        Chat.sendUserMessage(text);

        setTimeout(() => { dom.sendBtn.disabled = false; }, 300);
    }

    // ============================================
    // 事件绑定
    // ============================================
    function bindEvents() {
        // --- 发送消息 ---
        dom.sendBtn.addEventListener("click", sendMessage);
        dom.messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        dom.messageInput.addEventListener("input", () => {
            UI.autoResizeTextarea(dom.messageInput);
            // 如果输入框没有 [图] 占位符了，清空待发送图片队列
            if (!dom.messageInput.value.includes("[图]")) {
                _pendingImages = [];
            }
        });

        // --- 表情 ---
        dom.emojiBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dom.messageInput.blur();
            setTimeout(() => toggleEmojiPanel(), 100);
        });
        document.addEventListener("click", (e) => {
            if (!dom.emojiPanel.contains(e.target) && e.target !== dom.emojiBtn && !dom.emojiBtn.contains(e.target)) {
                dom.emojiPanel.classList.remove("show");
            }
        });

        // --- 抽屉：字卡管理 ---
        dom.cardMgrBtn.addEventListener("click", () => {
            _renderGroupTabs();
            renderCardList();
            _updateGroupManageUI();
            openDrawer(dom.cardDrawer, dom.cardOverlay);
        });
        dom.closeCardBtn.addEventListener("click", () => closeDrawer(dom.cardDrawer, dom.cardOverlay));
        dom.cardOverlay.addEventListener("click", () => closeDrawer(dom.cardDrawer, dom.cardOverlay));

        // --- 抽屉：设置 ---
        dom.settingsBtn.addEventListener("click", () => {
            renderSettings();
            openDrawer(dom.settingsDrawer, dom.settingsOverlay);
        });
        dom.closeSettingsBtn.addEventListener("click", () => closeDrawer(dom.settingsDrawer, dom.settingsOverlay));
        dom.settingsOverlay.addEventListener("click", () => closeDrawer(dom.settingsDrawer, dom.settingsOverlay));

        // --- 字卡添加 ---
        dom.addCardBtn.addEventListener("click", () => {
            _addCardsFromInput();
        });
        // Ctrl+Enter / Cmd+Enter 快捷添加字卡
        dom.cardInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                _addCardsFromInput();
            }
        });

        // --- 字卡搜索 ---
        dom.cardSearch.addEventListener("input", UI.debounce(renderCardList, 200));

        // --- 字卡批量操作 ---
        dom.batchModeBtn.addEventListener("click", _enterBatchMode);
        dom.exitBatchBtn.addEventListener("click", _exitBatchMode);
        dom.selectAllBtn.addEventListener("click", _selectAllCards);
        dom.deselectAllBtn.addEventListener("click", _deselectAllCards);
        dom.batchDeleteBtn.addEventListener("click", _batchDeleteCards);

        // --- 字卡分组 ---
        dom.addGroupBtn.addEventListener("click", _addGroup);
        dom.renameGroupBtn.addEventListener("click", _renameGroup);
        dom.deleteGroupBtn.addEventListener("click", _deleteGroup);
        dom.exitGroupManageBtn.addEventListener("click", () => {
            CardManager.setActiveGroup("all");
            _renderGroupTabs();
            renderCardList();
            _updateGroupManageUI();
        });

        // --- 设置项：个人信息 ---
        dom.userNameInput.addEventListener("change", () => {
            Settings.set("userName", dom.userNameInput.value || "我");
            _updateAvatarPreview("user");
            renderMessages();
            UI.toast("已保存");
        });
        dom.userAvatarInput.addEventListener("change", () => {
            Settings.set("userAvatar", dom.userAvatarInput.value.trim());
            _updateAvatarPreview("user");
            renderMessages();
            UI.toast("已保存");
        });
        dom.taNameInput.addEventListener("change", () => {
            Settings.set("taName", dom.taNameInput.value || "TA");
            renderHeader();
            _updateAvatarPreview("ta");
            renderMessages();
            UI.toast("已保存");
        });
        dom.taAvatarInput.addEventListener("change", () => {
            Settings.set("taAvatar", dom.taAvatarInput.value.trim());
            _updateAvatarPreview("ta");
            renderMessages();
            UI.toast("已保存");
        });

        // --- 头像图片上传 ---
        dom.userAvatarUploadBtn.addEventListener("click", () => {
            _handleAvatarUpload("user");
        });
        dom.taAvatarUploadBtn.addEventListener("click", () => {
            _handleAvatarUpload("ta");
        });
        dom.userAvatarClearBtn.addEventListener("click", () => {
            Settings.set("userAvatarImage", "");
            _updateAvatarPreview("user");
            renderMessages();
            UI.toast("已清除头像图片");
        });
        dom.taAvatarClearBtn.addEventListener("click", () => {
            Settings.set("taAvatarImage", "");
            _updateAvatarPreview("ta");
            renderMessages();
            UI.toast("已清除头像图片");
        });

        // --- 设置项：对话体验 ---
        dom.typingDelayInput.addEventListener("change", () => {
            const val = parseFloat(dom.typingDelayInput.value);
            if (isNaN(val) || val < 0) {
                Settings.set("typingDelay", 0.8);
                dom.typingDelayInput.value = 0.8;
            } else {
                Settings.set("typingDelay", Math.min(val, 10));
            }
            UI.toast("已保存");
        });
        dom.typingAnimToggle.addEventListener("change", () => {
            Settings.set("typingAnimation", dom.typingAnimToggle.checked);
        });
        dom.showTimeToggle.addEventListener("change", () => {
            Settings.set("showTimestamp", dom.showTimeToggle.checked);
            renderMessages();
        });

        // --- 设置项：外观 ---
        UI.$$(".theme-dot").forEach((dot) => {
            dot.addEventListener("click", () => {
                Settings.set("theme", dot.dataset.theme);
                UI.$$(".theme-dot").forEach((d) => d.classList.remove("active"));
                dot.classList.add("active");
            });
        });
        dom.bgSelect.addEventListener("change", () => {
            Settings.set("background", dom.bgSelect.value);
        });

        // --- 数据导出 ---
        dom.exportBtn.addEventListener("click", () => {
            const data = Storage.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chat-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UI.toast("已导出");
        });

        // --- 数据导入 ---
        dom.importBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    const confirmed = await UI.confirm("导入将覆盖当前数据，确定继续？");
                    if (!confirmed) return;
                    Storage.importAll(data);
                    Settings.init();
                    CardManager.init();
                    Chat.init();
                    renderAll();
                    UI.toast("导入成功");
                } catch (err) {
                    UI.toast("导入失败：文件格式错误");
                }
            });
            input.click();
        });

        // --- 清空聊天 ---
        dom.clearChatBtn.addEventListener("click", async () => {
            const confirmed = await UI.confirm("确定清空所有聊天记录？此操作不可撤销。");
            if (confirmed) {
                Chat.clearAll();
                renderMessages();
                _updateStats();
                UI.toast("聊天记录已清空");
            }
        });

        // --- 重置全部 ---
        dom.resetBtn.addEventListener("click", async () => {
            const confirmed = await UI.confirm("确定重置全部数据？所有聊天记录、字卡和设置都将被清除！");
            if (confirmed) {
                Storage.resetAll();
                location.reload();
            }
        });

        // --- EventBus 监听 ---
        EventBus.on(Events.MESSAGE_SENT, (msg) => {
            _appendMessage(msg);
            _updateStats();
        });

        EventBus.on(Events.MESSAGE_RECEIVED, (msg) => {
            if (msg) {
                _appendMessage(msg);
                _updateStats();
            }
        });

        EventBus.on(Events.TA_TYPING, () => {
            _renderTypingIndicator();
            dom.taStatus.textContent = "正在输入...";
        });

        EventBus.on(Events.TA_IDLE, () => {
            _removeTypingIndicator();
            dom.taStatus.textContent = "在线";
        });

        EventBus.on(Events.CARD_ADDED, () => _updateStats());
        EventBus.on(Events.CARD_DELETED, () => _updateStats());
        EventBus.on(Events.CARD_UPDATED, () => _updateStats());

        EventBus.on(Events.MESSAGE_CLEARED, () => {
            renderMessages();
            _updateStats();
        });

        // 存储容量告警
        EventBus.on(Events.STORAGE_WARNING, (msg) => {
            UI.toast(msg, 4000);
        });

        // ESC 关闭抽屉
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllDrawers();
                dom.emojiPanel.classList.remove("show");
            }
        });

        // 窗口尺寸变化时重新滚动到底部
        window.addEventListener("orientationchange", () => {
            setTimeout(() => UI.scrollToBottom(false), 300);
        });
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
