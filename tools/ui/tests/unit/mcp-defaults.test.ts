import { describe, expect, it } from 'vitest';
import {
	isMcpServerEnabledByDefault,
	isSensitiveMcpServer,
	parseMcpServerSettingsWithLocalDefaults
} from '$lib/utils/mcp';
import type { MCPServerSettingsEntry } from '$lib/types/mcp';
import { DEFAULT_LOCAL_MCP_SERVERS } from '$lib/constants/mcp';

function server(name: string, port: number, enabled = true): MCPServerSettingsEntry {
	return {
		id: name,
		name,
		enabled,
		url: `http://127.0.0.1:${port}/sse`
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
});
