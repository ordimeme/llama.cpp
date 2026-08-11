// ==UserScript==
// @name         llama.cpp Web UI 中文补丁
// @namespace    http://127.0.0.1:8081
// @version      1.0
// @description  将 llama.cpp Web UI 界面翻译为中文
// @author       hsbot
// @match        http://127.0.0.1:8081/*
// @grant        none
// ==/UserScript==
/* 用法：复制此文件内容，粘贴到浏览器控制台运行。
   或安装 Tampermonkey/Violentmonkey 扩展后导入。 */

(function() {
    'use strict';

    const LANG = {
        // ── 侧栏 ──
        'New chat': '新对话',
        'Search': '搜索',
        'MCP Servers': 'MCP 服务',
        'Settings': '设置',
        'Recent conversations': '最近对话',
        'No conversations yet': '暂无对话',
        'Toggle Sidebar': '切换侧栏',

        // ── 聊天页 ──
        'Hello there': '你好',
        'Type a message or upload files to get started': '输入消息或上传文件开始对话',
        'Type a message...': '输入消息...',
        'Add files, prompts, tools or MCP Servers': '添加文件、提示词、工具或 MCP 服务',
        'Send': '发送',
        'Scroll to bottom': '滚动到底部',

        // ── MCP 页 ──
        'Add New Server': '添加新服务',
        'Connection Log': '连接日志',
        'Failed to fetch': '连接失败',
        'No MCP Servers configured yet. Add one to enable agentic features.': '暂无 MCP 服务，添加一个以启用工具功能。',
        'Server URL': '服务器地址',
        'Enabled': '已启用',
        'Request Timeout (seconds)': '请求超时（秒）',
        'Custom Headers': '自定义请求头',
        'Test Connection': '测试连接',
        'Save': '保存',
        'Cancel': '取消',
        'Delete': '删除',
        'Edit': '编辑',
        'Actions': '操作',
        'Status': '状态',
        'Connected': '已连接',
        'Disconnected': '未连接',
        'Reconnect': '重新连接',
        'Remove': '移除',

        // ── 设置页 ──
        'General': '通用',
        'Appearance': '外观',
        'Theme': '主题',
        'Language': '语言',
        'Model': '模型',
        'Generation': '生成参数',
        'Temperature': '温度',
        'Max tokens': '最大 Token',
        'Top P': 'Top P',
        'Stop sequences': '停止序列',
        'System prompt': '系统提示词',
        'Advanced': '高级',
        'Reset to defaults': '重置为默认',
        'About': '关于',

        // ── 对话 ──
        'Copy': '复制',
        'Copy code': '复制代码',
        'Copied': '已复制',
        'Delete conversation': '删除对话',
        'Edit message': '编辑消息',
        'Regenerate': '重新生成',
        'Continue': '继续',
        'Stop generating': '停止生成',
        'Thinking...': '思考中...',

        // ── 通用 ──
        'Loading...': '加载中...',
        'Error': '错误',
        'Warning': '警告',
        'Success': '成功',
        'Info': '信息',
        'Confirm': '确认',
        'Close': '关闭',
        'Yes': '是',
        'No': '否',
        'OK': '确定',
        'Apply': '应用',
        'Submit': '提交',
        'Back': '返回',
    };

    let active = true;

    function translateNode(node) {
        if (!active || !node) return;
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text && LANG[text] !== undefined) {
                node.textContent = LANG[text];
            }
            return;
        }
        // 处理 placeholder
        if (node.placeholder && LANG[node.placeholder] !== undefined) {
            node.placeholder = LANG[node.placeholder];
        }
        if (node.title && LANG[node.title] !== undefined) {
            node.title = LANG[node.title];
        }
        // 递归子节点
        for (const child of node.childNodes) {
            translateNode(child);
        }
    }

    const observer = new MutationObserver(function(mutations) {
        if (!active) return;
        for (const m of mutations) {
            for (const added of m.addedNodes) {
                translateNode(added);
            }
            // 也查改过的节点
            if (m.type === 'characterData' && m.target) {
                translateNode(m.target);
            }
        }
    });

    function start() {
        // 翻译现有内容
        translateNode(document.body);
        // 监听后续变化
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        console.log('🀄 llama.cpp 中文补丁已激活');
    }

    // 页面完全加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // 挂在 window 上方便开关
    window.__llama_cn = {
        enable: () => { active = true; translateNode(document.body); console.log('中文补丁已开启'); },
        disable: () => { active = false; console.log('中文补丁已关闭'); },
        toggle: () => { active ? window.__llama_cn.disable() : window.__llama_cn.enable(); },
    };
})();
