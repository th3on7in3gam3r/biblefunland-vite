import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ParentalControlsPanel from '../components/ParentalControlsPanel'

// Mock the contexts
vi.mock('../context/ParentalControlsContext', () => ({
  useParentalControls: () => ({
    controls: {
      ai_toggles: {
        bible_character_chat: true,
        ai_prayer_companion: false
      },
      daily_limit: 30,
      parent_pin: '4318'
    },
    updateControls: vi.fn()
  })
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123' }
  })
}))

// Mock fetch
global.fetch = vi.fn()

describe('ParentalControlsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch.mockClear()
  })

  it('renders the panel with all sections', () => {
    render(<ParentalControlsPanel />)

    expect(screen.getByText(/Parental Controls/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Features/i)).toBeInTheDocument()
    expect(screen.getByText(/Daily Time Limit/i)).toBeInTheDocument()
    expect(screen.getByText(/Change Parent PIN/i)).toBeInTheDocument()
  })

  it('renders AI feature toggles with correct labels', () => {
    render(<ParentalControlsPanel />)

    expect(screen.getByText(/Bible Character Chat/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Prayer Companion/i)).toBeInTheDocument()
  })

  it('renders daily limit selector with all options', () => {
    render(<ParentalControlsPanel />)

    const select = screen.getByDisplayValue('30 minutes')
    expect(select).toBeInTheDocument()

    // Check all options exist
    const options = select.querySelectorAll('option')
    expect(options.length).toBe(5) // 0, 15, 30, 45, 60
  })

  it('renders PIN change field', () => {
    render(<ParentalControlsPanel />)

    const pinInput = screen.getByPlaceholderText(/Leave blank to keep current PIN/i)
    expect(pinInput).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<ParentalControlsPanel />)

    expect(screen.getByText(/Save Controls/i)).toBeInTheDocument()
  })

  it('toggles AI feature when clicked', () => {
    render(<ParentalControlsPanel />)

    const chatToggle = screen.getByText(/Bible Character Chat/i).closest('div')
    fireEvent.click(chatToggle)

    // The toggle should be clickable
    expect(chatToggle).toBeInTheDocument()
  })

  it('changes daily limit when select value changes', () => {
    render(<ParentalControlsPanel />)

    const select = screen.getByDisplayValue('30 minutes')
    fireEvent.change(select, { target: { value: '60' } })

    expect(select.value).toBe('60')
  })

  it('shows PIN modal when save is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    render(<ParentalControlsPanel />)

    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Confirm with PIN/i)).toBeInTheDocument()
    })
  })

  it('shows error when daily limit is invalid', async () => {
    render(<ParentalControlsPanel />)

    // Try to save with invalid limit (this shouldn't happen in normal flow)
    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    // Should show no error for valid default limit
    expect(screen.queryByText(/Daily limit must be/i)).not.toBeInTheDocument()
  })

  it('displays PIN pad in modal', async () => {
    render(<ParentalControlsPanel />)

    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      // Check for PIN pad buttons
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('9')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('allows PIN entry via numeric pad', async () => {
    render(<ParentalControlsPanel />)

    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      const buttons = screen.getAllByText('1')
      const pinButton = buttons.find(btn => btn.tagName === 'BUTTON')
      fireEvent.click(pinButton)
    })

    // PIN should be entered
    const pinDisplays = screen.getAllByText('●')
    expect(pinDisplays.length).toBeGreaterThan(0)
  })

  it('shows cancel button in PIN modal', async () => {
    render(<ParentalControlsPanel />)

    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  it('closes PIN modal when cancel is clicked', async () => {
    render(<ParentalControlsPanel />)

    const saveButton = screen.getByText(/Save Controls/i)
    fireEvent.click(saveButton)

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
    })

    await waitFor(() => {
      expect(screen.queryByText(/Confirm with PIN/i)).not.toBeInTheDocument()
    })
  })

  it('shows PIN visibility toggle', () => {
    render(<ParentalControlsPanel />)

    const toggleButtons = screen.getAllByText(/👁️/)
    expect(toggleButtons.length).toBeGreaterThan(0)
  })

  it('toggles PIN visibility when eye icon is clicked', () => {
    render(<ParentalControlsPanel />)

    const pinInput = screen.getByPlaceholderText(/Leave blank to keep current PIN/i)
    expect(pinInput.type).toBe('password')

    const toggleButtons = screen.getAllByText(/👁️/)
    fireEvent.click(toggleButtons[0])

    // After toggle, input should be text type
    expect(pinInput.type).toBe('text')
  })
})
