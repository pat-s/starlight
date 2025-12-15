/**
 * Formats a label string containing inline markdown to HTML.
 *
 * Supported syntax:
 * - `code` → <code>code</code>
 * - **bold** → <strong>bold</strong>
 * - *italic* → <em>italic</em>
 *
 * Edge cases render literally:
 * - Unmatched delimiters: `unclosed → `unclosed
 * - Escaped: \` → `
 *
 * @example
 * formatLabel('Install `package.json`')
 * // → 'Install <code>package.json</code>'
 *
 * @example
 * formatLabel('Use **bold** and *italic*')
 * // → 'Use <strong>bold</strong> and <em>italic</em>'
 */
export function formatLabel(label: string): string {
	if (!label) return '';

	// Escape HTML entities first to prevent XSS
	let result = escapeHtml(label);

	// Replace escaped backticks with a placeholder
	const ESCAPED_BACKTICK = '\x00';
	result = result.replace(/\\`/g, ESCAPED_BACKTICK);

	// Replace escaped asterisks with a placeholder
	const ESCAPED_ASTERISK = '\x01';
	result = result.replace(/\\\*/g, ESCAPED_ASTERISK);

	// Extract and replace code blocks with placeholders to protect their content
	const CODE_PLACEHOLDER = '\x02';
	const codeBlocks: string[] = [];
	result = result.replace(/`([^`]+)`/g, (_, content) => {
		codeBlocks.push(content);
		return CODE_PLACEHOLDER;
	});

	// Transform **bold** to <strong> (must have matching pairs with content)
	result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

	// Transform *italic* to <em> (must have matching pairs with content, not part of **)
	// This regex matches single asterisks that aren't adjacent to other asterisks
	result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

	// Restore code blocks
	let codeIndex = 0;
	result = result.replace(new RegExp(CODE_PLACEHOLDER, 'g'), () => {
		return `<code>${codeBlocks[codeIndex++]}</code>`;
	});

	// Restore escaped characters
	result = result.replace(new RegExp(ESCAPED_BACKTICK, 'g'), '`');
	result = result.replace(new RegExp(ESCAPED_ASTERISK, 'g'), '*');

	return result;
}

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
