/**
 * Security Utility: Strips code blocks, inline code, HTML code elements, and
 * direct code statement patterns from AI responses before they reach the client.
 *
 * This provides the hard non-negotiable guarantee that student-facing hints
 * never contain code snippets or corrected solutions.
 */
export function stripCodeBlocks(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // 1. Strip Markdown fenced code blocks: ```language ... ``` and ~~~language ... ~~~
  sanitized = sanitized.replace(/```[\s\S]*?```/g, ' [code removed] ');
  sanitized = sanitized.replace(/~~~[\s\S]*?~~~/g, ' [code removed] ');

  // 2. Strip HTML <code>, <pre>, and <script> tags and their contents
  sanitized = sanitized.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' [code removed] ');
  sanitized = sanitized.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' [code removed] ');
  sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' [code removed] ');

  // 3. Strip remaining inline code markdown (`...`)
  sanitized = sanitized.replace(/`([^`]+)`/g, '$1');

  // 4. Strip indented code blocks (4 spaces or tab at start of line with code-like tokens)
  sanitized = sanitized.replace(/^(?: {4}|\t)(.*[;{}()=><].*)$/gm, '[code line removed]');

  // 5. Line-by-line heuristic filter for direct code statements
  const lines = sanitized.split('\n');
  const cleanedLines: string[] = [];

  const codeLinePatterns = [
    /^\s*#include\s+[<"].*[>"]/,                         // C++ include
    /^\s*(import|from)\s+[a-zA-Z0-9_.]+\s+(import)?/,     // Python / JS import
    /^\s*(int|double|float|char|void|bool|auto|vector<.*>|string)\s+[a-zA-Z0-9_]+\s*([=;({]|\[)/, // C++ decl
    /^\s*(def|class)\s+[a-zA-Z0-9_]+\s*[:(]/,            // Python def / class
    /^\s*(for|while|if)\s*\(.*?\)\s*[{;]?\s*$/,          // Control flow header
    /^\s*return\s+[^;.\n]+;?\s*$/,                       // Return statement
    /^\s*(cout|cin|printf|scanf|std::cout|std::cin)\s*[<>=]/, // C++ I/O
    /^\s*print\(.*\)\s*$/,                               // Python print
    /^\s*[a-zA-Z0-9_]+\s*=\s*[^;.\n]+;?\s*$/,           // Simple assignment (e.g. x = y + 1)
  ];

  for (const line of lines) {
    const isCodeLine = codeLinePatterns.some((pattern) => pattern.test(line));
    if (isCodeLine) {
      cleanedLines.push('[code removed]');
    } else {
      cleanedLines.push(line);
    }
  }

  sanitized = cleanedLines.join('\n');

  // 6. Clean up excessive whitespace and leftover markers
  sanitized = sanitized.replace(/\[code removed\](\s*\[code removed\])+/g, '[code removed]');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n').trim();

  return sanitized;
}
