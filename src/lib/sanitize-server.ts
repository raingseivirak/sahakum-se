import sanitizeHtml from 'sanitize-html'

export function sanitizeEditorHTML(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'mark', 'hr'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'class'],
      div: ['class'],
      span: ['class'],
      mark: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  })
}
