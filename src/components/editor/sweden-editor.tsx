"use client"

/**
 * ⚠️ SECURITY NOTICE: This editor's output is sanitized on the frontend
 *
 * If you add new TipTap extensions, HTML tags, CSS classes, or attributes,
 * you MUST update the sanitization configuration in:
 * → src/lib/sanitize.ts
 *
 * Otherwise content may be stripped when displayed to users!
 *
 * 🛡️ CSP COMPATIBILITY NOTICE:
 * This editor is compatible with Content Security Policy (CSP) headers.
 * The CSP configuration in next.config.js allows:
 * - 'unsafe-inline' for styles (required for TipTap toolbar styling)
 * - 'self' for scripts (blocks inline JavaScript for security)
 * - data: and blob: for images (supports editor image functionality)
 *
 * If you add extensions that require additional CSP permissions:
 * → Update the CSP policy in next.config.js
 * → Test with csp-test.html to verify security isn't compromised
 */

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Heading } from '@tiptap/extension-heading'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Paragraph } from '@tiptap/extension-paragraph'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Palette,
  ChevronDown,
  Globe,
} from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { MediaPicker } from './media-picker'

interface SwedenEditorProps {
  content: string
  onChange: (content: string) => void
  language?: 'sv' | 'en' | 'km'
  placeholder?: string
  className?: string
}

export function SwedenEditor({
  content,
  onChange,
  language = 'en',
  placeholder = 'Start writing...',
  className = '',
}: SwedenEditorProps) {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable default extensions we're configuring separately
        heading: false,
        bold: false,
        italic: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        paragraph: false,
        hardBreak: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),

      // Sweden brand-compliant heading configuration
      Heading.configure({
        levels: [1, 2, 3, 4],
        HTMLAttributes: {
          class: `${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight`,
        },
      }),

      // Sweden Sans typography for paragraphs
      Paragraph.configure({
        HTMLAttributes: {
          class: `${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal`,
        },
      }),

      // Bold with Sweden Sans weight
      Bold.configure({
        HTMLAttributes: {
          class: 'font-semibold',
        },
      }),

      // Italic styling
      Italic,

      // Links with Sweden blue color
      Link.configure({
        HTMLAttributes: {
          class: 'text-sweden-blue hover:text-sweden-blue-navy underline',
        },
        openOnClick: false,
      }),

      // Lists with proper spacing
      BulletList.configure({
        HTMLAttributes: {
          class: `${fontClass} space-y-1`,
        },
      }),

      OrderedList.configure({
        HTMLAttributes: {
          class: `${fontClass} space-y-1`,
        },
      }),

      ListItem.configure({
        HTMLAttributes: {
          class: `${fontClass} text-sweden-body`,
        },
      }),

      // Blockquote with Sweden styling
      Blockquote.configure({
        HTMLAttributes: {
          class: `${fontClass} border-l-4 border-sweden-blue pl-4 italic text-sweden-body`,
        },
      }),

      // Code styling
      Code.configure({
        HTMLAttributes: {
          class: 'bg-sweden-neutral-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),

      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-sweden-neutral-100 p-4 rounded-md font-mono text-sm',
        },
      }),

      // Horizontal rule
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-sweden-neutral-200 my-6',
        },
      }),

      // Hard break
      HardBreak,

      // Text styling
      TextStyle,
      Color,

      // Highlight with Sweden yellow
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-sweden-yellow-soft',
        },
      }),

      // Image support with enhanced selection
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md cursor-pointer transition-all duration-200',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sweden max-w-none focus:outline-none ${fontClass} sweden-editor-content ${className}`,
        'data-language': language,
      },
      handleKeyDown: (view, event) => {
        // Handle Delete key for selected images
        if (event.key === 'Delete' || event.key === 'Backspace') {
          const { state } = view
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node && node.type.name === 'image') {
            // Let TipTap handle the deletion
            return false
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setHeading = useCallback(
    (level: 1 | 2 | 3 | 4) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run()
      }
    },
    [editor]
  )

  const setParagraph = useCallback(() => {
    if (editor) {
      editor.chain().focus().setParagraph().run()
    }
  }, [editor])

  const toggleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run()
    }
  }, [editor])

  const toggleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run()
    }
  }, [editor])

  const toggleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run()
    }
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run()
    }
  }, [editor])

  const toggleBlockquote = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run()
    }
  }, [editor])

  const toggleCode = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleCode().run()
    }
  }, [editor])

  const setHorizontalRule = useCallback(() => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    }
  }, [editor])

  const addImageFromMedia = useCallback((mediaFile: any, width?: string, height?: string) => {
    if (editor) {
      const imageAttrs: any = {
        src: mediaFile.url,
        alt: mediaFile.altText || mediaFile.originalName,
        title: mediaFile.caption || mediaFile.originalName
      }

      if (width) imageAttrs.width = width
      if (height) imageAttrs.height = height

      editor.chain().focus().setImage(imageAttrs).run()
    }
  }, [editor])

  const addImageFromURL = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter image URL:')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter URL:')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      } else {
        editor.chain().focus().unsetLink().run()
      }
    }
  }, [editor])

  const toggleHighlight = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleHighlight().run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-input rounded-md overflow-hidden">
      {/* Sweden Brand Toolbar */}
      <div className="border-b border-input bg-sweden-neutral-50 p-2">
        <div className="flex flex-wrap items-center gap-1">

          {/* Typography Hierarchy - Sweden Brand */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
              size="sm"
              onClick={setParagraph}
              className={`h-8 px-2 ${fontClass}`}
            >
              <Type className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHeading(1)}
              className={`h-8 px-2 ${fontClass}`}
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHeading(2)}
              className={`h-8 px-2 ${fontClass}`}
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHeading(3)}
              className={`h-8 px-2 ${fontClass}`}
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 4 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setHeading(4)}
              className={`h-8 px-2 ${fontClass}`}
            >
              <Heading4 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleBold}
              className="h-8 px-2"
            >
              <BoldIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleItalic}
              className="h-8 px-2"
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('highlight') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleHighlight}
              className="h-8 px-2"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists and Structure */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleBulletList}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleOrderedList}
              className="h-8 px-2"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleBlockquote}
              className="h-8 px-2"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Media and Links */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('link') ? 'default' : 'ghost'}
              size="sm"
              onClick={setLink}
              className="h-8 px-2"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-2 gap-1">
                <ImageIcon className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-input shadow-md">
                <div className="p-1">
                  <MediaPicker
                    onSelect={(fileWithDimensions: any) =>
                      addImageFromMedia(fileWithDimensions, fileWithDimensions.width, fileWithDimensions.height)
                    }
                    allowedTypes={['images']}
                    language={language}
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start ${fontClass}`}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        From Media Library
                      </Button>
                    }
                  />
                </div>
                <DropdownMenuItem
                  onClick={addImageFromURL}
                  className={`cursor-pointer ${fontClass}`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  From URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleCode}
              className="h-8 px-2"
            >
              <CodeIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={setHorizontalRule}
              className="h-8 px-2"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px] p-4">
        <EditorContent
          editor={editor}
          className={`${fontClass} sweden-editor-wrapper`}
        />
      </div>
    </div>
  )
}