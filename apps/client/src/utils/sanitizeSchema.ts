import { defaultSchema } from 'rehype-sanitize';

/**
 * Curated rehype-sanitize schema permitting MathML tags and KaTeX classes/styles
 * while stripping unsafe HTML tags, event handlers, and javascript: pseudo-protocols.
 */
export const katexSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'math',
    'semantics',
    'mrow',
    'mi',
    'mo',
    'mn',
    'annotation',
    'mtext',
    'msup',
    'msub',
    'mfrac',
    'mover',
    'munder',
    'msqrt',
    'mroot',
    'svg',
    'path',
  ],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style', 'ariaHidden'],
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
    svg: ['width', 'height', 'viewBox', 'ariaHidden'],
    path: ['d'],
  },
};
