/**
 * ============================================
 * UI - 界面工具模块
 * 提供 DOM 操作辅助、格式化、Toast、Modal 等
 * ============================================
 */
const UI = (function () {
    /**
     * 快速获取元素
     */
    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * 创建 DOM 元素
     */
    function createElement(tag, className, content) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (content !== undefined) el.textContent = content;
        return el;
    }

    /**
     * HTML 转义（防止 XSS）
     */
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化时间
     */
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        if (isToday) {
            return `${hours}:${minutes}`;
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isYesterday) {
            return `昨天 ${hours}:${minutes}`;
        }

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${month}/${day} ${hours}:${minutes}`;
    }

    /**
     * 格式化日期分隔符
     */
    function formatDateSeparator(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) return "今天";

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isYesterday) return "昨天";

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const currentYear = now.getFullYear();

        if (year === currentYear) {
            return `${month}月${day}日`;
        }
        return `${year}年${month}月${day}日`;
    }

    /**
     * 获取日期 key（用于判断是否需要显示日期分隔符）
     */
    function getDateKey(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    /**
     * Toast 提示
     */
    let toastTimer = null;
    function toast(message, duration) {
        duration = duration || 2000;
        const el = $("#toast");
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.classList.remove("show");
        }, duration);
    }

    /**
     * 确认弹窗
     * @returns {Promise<boolean>}
     */
    function confirm(message) {
        return new Promise((resolve) => {
            const overlay = $("#modalOverlay");
            const text = $("#modalText");
            const cancelBtn = $("#modalCancel");
            const confirmBtn = $("#modalConfirm");

            text.textContent = message;
            overlay.classList.add("show");

            function cleanup() {
                overlay.classList.remove("show");
                cancelBtn.removeEventListener("click", onCancel);
                confirmBtn.removeEventListener("click", onConfirm);
            }

            function onCancel() {
                cleanup();
                resolve(false);
            }

            function onConfirm() {
                cleanup();
                resolve(true);
            }

            cancelBtn.addEventListener("click", onCancel);
            confirmBtn.addEventListener("click", onConfirm);
        });
    }

    /**
     * 滚动到聊天底部
     */
    function scrollToBottom(smooth) {
        const body = $("#chatBody");
        if (smooth) {
            body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
        } else {
            body.scrollTop = body.scrollHeight;
        }
    }

    /**
     * 自动调整 textarea 高度
     */
    function autoResizeTextarea(el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }

    /**
     * 防抖
     */
    function debounce(fn, delay) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    return {
        $, $$, createElement, escapeHtml,
        formatTime, formatDateSeparator, getDateKey,
        toast, confirm, scrollToBottom, autoResizeTextarea, debounce,
    };
})();
