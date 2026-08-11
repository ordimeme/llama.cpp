import { describe, expect, it } from 'vitest';
import {
	isMcpServerEnabledByDefault,
	isSensitiveMcpServer,
	parseMcpServerSettings,
	parseMcpServerSettingsWithLocalDefaults
} from '$lib/utils/mcp';
import type { MCPServerSettingsEntry } from '$lib/types/mcp';
import { DEFAULT_LOCAL_MCP_SERVERS } from '$lib/constants/mcp';

function server(name: string, port: number, enabled = true): MCPServerSettingsEntry {
	return {
		id: name,
		name,
		enabled,
		url: `http://127.0.0.1:${port}/`
	};
}

describe('MCP default enable policy', () => {
	it('keeps Binance and DevOps available but disabled for chats by default', () => {
		expect(isSensitiveMcpServer(server('binance', 9103))).toBe(true);
		expect(isMcpServerEnabledByDefault(server('binance', 9103))).toBe(false);
		expect(isMcpServerEnabledByDefault(server('devops', 9101))).toBe(false);
		expect(isSensitiveMcpServer(server('unnamed', 9103))).toBe(true);
	});

	it('enables other globally available MCP servers by default', () => {
		expect(isMcpServerEnabledByDefault(server('filesystem', 9106))).toBe(true);
		expect(isMcpServerEnabledByDefault(server('shared_memory', 9102))).toBe(true);
		expect(isMcpServerEnabledByDefault(server('search', 9105, false))).toBe(false);
	});

	it('ships all six local bridge endpoints while only four are chat-enabled by default', () => {
		expect(DEFAULT_LOCAL_MCP_SERVERS).toHaveLength(6);
		expect(DEFAULT_LOCAL_MCP_SERVERS.every((entry) => entry.enabled)).toBe(true);
		expect(
			DEFAULT_LOCAL_MCP_SERVERS.filter(isMcpServerEnabledByDefault).map((entry) => entry.id)
		).toEqual(['shared_memory', 'proxy', 'search', 'filesystem']);
	});

	it('recovers the local defaults from an old explicitly empty configuration', () => {
		expect(parseMcpServerSettingsWithLocalDefaults('[]')).toEqual(DEFAULT_LOCAL_MCP_SERVERS);
	});

	it('normalizes legacy /sse URLs for local bridges (streamable HTTP only)', () => {
		const legacy = [
			{ id: 'devops', name: 'DevOps', enabled: true, url: 'http://127.0.0.1:9101/sse' },
			{ id: 'binance', name: 'Binance', enabled: true, url: 'http://127.0.0.1:9103/sse' },
			{ id: 'external', name: 'External SSE', enabled: true, url: 'https://example.com/sse' }
		];
		const parsed = parseMcpServerSettings(JSON.stringify(legacy));
		expect(parsed[0].url).toBe('http://127.0.0.1:9101/');
		expect(parsed[1].url).toBe('http://127.0.0.1:9103/');
		// 外部 SSE 服务器保持原样（非本地桥不归一化）
		expect(parsed[2].url).toBe('https://example.com/sse');
	});
});
