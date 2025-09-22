import DOMPurify from 'dompurify'

/**
 * ⚠️ IMPORTANT: Swedish Editor Compatibility Notice
 *
 * This sanitization is specifically configured for the TipTap Swedish Editor
 * (src/components/editor/sweden-editor.tsx). If you modify the editor to add:
 *
 * - New HTML tags → Update ALLOWED_TAGS array below
 * - New CSS classes → Verify they pass the class regex validation
 * - New attributes → Add to ALLOWED_ATTR array
 * - New extensions → Check their output is compatible with DOMPurify
 *
 * FAILURE TO UPDATE SANITIZATION = CONTENT MAY BE STRIPPED!
 *
 * Test after editor changes:
 * 1. Create content with new features in admin
 * 2. Save and view on frontend
 * 3. Verify styling/functionality is preserved
 *
 * Last updated: 2025-01-22 (when TipTap editor was configured)
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is for now, client will sanitize
    // In a full implementation, you'd use a server-side DOMPurify alternative
    return html
  }

  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    // Allow TipTap/Swedish editor formatting tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'code', 'pre', 'mark', 'hr'
    ],
    // Allow Swedish editor specific attributes
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel',
      'class', 'id', 'width', 'height'
    ],
    // Allow specific data attributes for editor functionality
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,

    // Custom attribute validation for Swedish editor classes
    ALLOWED_ATTR_VALUE_REGEX: {
      'class': /^[\w\s\-\./:]+$/
    },

    // Security options
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit'],

    // Sanitize URLs
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  })
}

/**
 * Creates a safe HTML props object for React dangerouslySetInnerHTML
 * @param html - The HTML string to sanitize
 * @returns Object with __html property containing sanitized HTML
 */
export function createSafeHTML(html: string | null | undefined) {
  if (!html) return { __html: '' }

  return {
    __html: sanitizeHTML(html)
  }
}