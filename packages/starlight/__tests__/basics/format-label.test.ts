import { describe, expect, test } from 'vitest';
import { formatLabel } from '../../utils/format-label';

describe('formatLabel', () => {
	describe('inline code (backticks)', () => {
		test('transforms `code` to <code>', () => {
			expect(formatLabel('Use `const` here')).toBe('Use <code>const</code> here');
		});

		test('handles multiple code spans', () => {
			expect(formatLabel('Use `foo` and `bar`')).toBe(
				'Use <code>foo</code> and <code>bar</code>'
			);
		});

		test('renders unmatched backtick literally', () => {
			expect(formatLabel('Use `const')).toBe('Use `const');
		});

		test('handles escaped backticks', () => {
			expect(formatLabel('Use \\`code\\` here')).toBe('Use `code` here');
		});

		test('handles code at start of string', () => {
			expect(formatLabel('`code` is here')).toBe('<code>code</code> is here');
		});

		test('handles code at end of string', () => {
			expect(formatLabel('here is `code`')).toBe('here is <code>code</code>');
		});

		test('handles only code', () => {
			expect(formatLabel('`code`')).toBe('<code>code</code>');
		});
	});

	describe('bold (double asterisks)', () => {
		test('transforms **bold** to <strong>', () => {
			expect(formatLabel('This is **bold**')).toBe('This is <strong>bold</strong>');
		});

		test('handles multiple bold spans', () => {
			expect(formatLabel('**one** and **two**')).toBe(
				'<strong>one</strong> and <strong>two</strong>'
			);
		});

		test('renders unmatched ** literally', () => {
			expect(formatLabel('This is **bold')).toBe('This is **bold');
		});

		test('handles escaped asterisks', () => {
			expect(formatLabel('Use \\*\\*not bold\\*\\*')).toBe('Use **not bold**');
		});
	});

	describe('italic (single asterisks)', () => {
		test('transforms *italic* to <em>', () => {
			expect(formatLabel('This is *italic*')).toBe('This is <em>italic</em>');
		});

		test('handles multiple italic spans', () => {
			expect(formatLabel('*one* and *two*')).toBe('<em>one</em> and <em>two</em>');
		});

		test('renders unmatched * literally', () => {
			expect(formatLabel('This is *italic')).toBe('This is *italic');
		});

		test('handles escaped asterisk', () => {
			expect(formatLabel('Use \\*not italic\\*')).toBe('Use *not italic*');
		});
	});

	describe('combinations', () => {
		test('handles code and bold together', () => {
			expect(formatLabel('Use `code` and **bold**')).toBe(
				'Use <code>code</code> and <strong>bold</strong>'
			);
		});

		test('handles code and italic together', () => {
			expect(formatLabel('Use `code` and *italic*')).toBe(
				'Use <code>code</code> and <em>italic</em>'
			);
		});

		test('handles bold and italic together', () => {
			expect(formatLabel('Use **bold** and *italic*')).toBe(
				'Use <strong>bold</strong> and <em>italic</em>'
			);
		});

		test('handles all three together', () => {
			expect(formatLabel('`code` **bold** *italic*')).toBe(
				'<code>code</code> <strong>bold</strong> <em>italic</em>'
			);
		});

		test('bold inside code renders asterisks literally', () => {
			expect(formatLabel('`**not bold**`')).toBe('<code>**not bold**</code>');
		});

		test('code inside bold', () => {
			expect(formatLabel('**Use `const`**')).toBe('<strong>Use <code>const</code></strong>');
		});
	});

	describe('HTML safety', () => {
		test('escapes HTML entities', () => {
			expect(formatLabel('<script>alert("xss")</script>')).toBe(
				'&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
			);
		});

		test('escapes entities before transformation', () => {
			expect(formatLabel('Use `<div>` tag')).toBe('Use <code>&lt;div&gt;</code> tag');
		});

		test('escapes ampersands', () => {
			expect(formatLabel('foo & bar')).toBe('foo &amp; bar');
		});

		test('escapes quotes', () => {
			expect(formatLabel("it's a \"test\"")).toBe('it&#39;s a &quot;test&quot;');
		});
	});

	describe('edge cases', () => {
		test('returns empty string for empty input', () => {
			expect(formatLabel('')).toBe('');
		});

		test('handles plain text without formatting', () => {
			expect(formatLabel('Just plain text')).toBe('Just plain text');
		});

		test('handles empty code spans', () => {
			// Empty backticks should render literally since there's no content
			expect(formatLabel('``')).toBe('``');
		});

		test('handles adjacent backticks', () => {
			expect(formatLabel('`a``b`')).toBe('<code>a</code><code>b</code>');
		});

		test('handles whitespace in code', () => {
			expect(formatLabel('` code `')).toBe('<code> code </code>');
		});
	});
});
