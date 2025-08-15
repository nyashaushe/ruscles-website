import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

const mockProps = {
  content: '<p>Initial content</p>',
  onChange: vi.fn(),
  placeholder: 'Enter your content...',
}

// Mock the editor library
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    getHTML: () => '<p>Test content</p>',
    commands: {
      setContent: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleHeading: vi.fn(),
      setLink: vi.fn(),
      insertContent: vi.fn(),
    },
    isActive: vi.fn(() => false),
    can: () => ({ toggleBold: () => true }),
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor Content</div>,
}))

describe('RichTextEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders editor with toolbar', () => {
    render(<RichTextEditor {...mockProps} />)
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /heading/i })).toBeInTheDocument()
  })

  it('handles bold formatting', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<p><strong>Bold text</strong></p>',
      commands: { toggleBold: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ toggleBold: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const boldButton = screen.getByRole('button', { name: /bold/i })
    await user.click(boldButton)
    
    expect(mockEditor.commands.toggleBold).toHaveBeenCalled()
  })

  it('handles italic formatting', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<p><em>Italic text</em></p>',
      commands: { toggleItalic: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ toggleItalic: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const italicButton = screen.getByRole('button', { name: /italic/i })
    await user.click(italicButton)
    
    expect(mockEditor.commands.toggleItalic).toHaveBeenCalled()
  })

  it('handles heading formatting', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<h2>Heading text</h2>',
      commands: { toggleHeading: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ toggleHeading: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const headingButton = screen.getByRole('button', { name: /heading/i })
    await user.click(headingButton)
    
    expect(mockEditor.commands.toggleHeading).toHaveBeenCalledWith({ level: 2 })
  })

  it('handles link insertion', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<p><a href="https://example.com">Link</a></p>',
      commands: { setLink: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ setLink: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const linkButton = screen.getByRole('button', { name: /link/i })
    await user.click(linkButton)
    
    // Mock window.prompt
    const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com')
    
    await user.click(linkButton)
    
    expect(mockEditor.commands.setLink).toHaveBeenCalledWith({ href: 'https://example.com' })
    
    mockPrompt.mockRestore()
  })

  it('handles image insertion', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<p><img src="image.jpg" alt="Test image" /></p>',
      commands: { insertContent: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ insertContent: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const imageButton = screen.getByRole('button', { name: /image/i })
    await user.click(imageButton)
    
    // Simulate file upload
    const fileInput = screen.getByTestId('image-upload-input')
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(mockEditor.commands.insertContent).toHaveBeenCalled()
    })
  })

  it('calls onChange when content changes', () => {
    const mockEditor = {
      getHTML: () => '<p>Updated content</p>',
      commands: {},
      isActive: vi.fn(() => false),
      can: () => ({}),
      on: vi.fn((event, callback) => {
        if (event === 'update') {
          callback()
        }
      }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    expect(mockProps.onChange).toHaveBeenCalledWith('<p>Updated content</p>')
  })

  it('shows active state for formatting buttons', () => {
    const mockEditor = {
      getHTML: () => '<p><strong>Bold text</strong></p>',
      commands: {},
      isActive: vi.fn((format) => format === 'bold'),
      can: () => ({}),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const boldButton = screen.getByRole('button', { name: /bold/i })
    expect(boldButton).toHaveClass('bg-accent')
  })

  it('disables buttons when commands are not available', () => {
    const mockEditor = {
      getHTML: () => '<p>Content</p>',
      commands: {},
      isActive: vi.fn(() => false),
      can: () => ({ toggleBold: () => false }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const boldButton = screen.getByRole('button', { name: /bold/i })
    expect(boldButton).toBeDisabled()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<RichTextEditor {...mockProps} />)
    
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Text formatting')
    expect(screen.getByRole('button', { name: /bold/i })).toHaveAttribute('aria-pressed')
    expect(screen.getByTestId('editor-content')).toHaveAttribute('role', 'textbox')
  })

  it('supports keyboard shortcuts', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      getHTML: () => '<p><strong>Bold text</strong></p>',
      commands: { toggleBold: vi.fn() },
      isActive: vi.fn(() => false),
      can: () => ({ toggleBold: () => true }),
    }
    
    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<RichTextEditor {...mockProps} />)
    
    const editor = screen.getByTestId('editor-content')
    await user.click(editor)
    await user.keyboard('{Control>}b{/Control}')
    
    expect(mockEditor.commands.toggleBold).toHaveBeenCalled()
  })
})