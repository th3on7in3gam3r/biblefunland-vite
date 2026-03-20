import { useEffect } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Enable jest-axe matchers
expect.extend(toHaveNoViolations)

/**
 * Development-only accessibility testing hook
 * Runs axe accessibility audit on component in dev mode
 * Results logged to console
 */
export function useAccessibilityAudit(containerRef, componentName = 'Component') {
  useEffect(() => {
    if (!import.meta.env.DEV || !containerRef?.current) return

    async function runAudit() {
      try {
        const results = await axe(containerRef.current)
        if (results.violations.length > 0) {
          console.warn(`♿ A11y violations in ${componentName}:`)
          results.violations.forEach((violation) => {
            console.warn(`  ⚠️  ${violation.description}`, violation)
          })
        } else {
          console.log(`✅ ${componentName} passed accessibility audit`)
        }
      } catch (error) {
        console.error('Accessibility audit error:', error)
      }
    }

    // Run audit after component mounts and renders
    const timer = setTimeout(runAudit, 1000)
    return () => clearTimeout(timer)
  }, [containerRef, componentName])
}

/**
 * Accessibility best practices checklist
 */
export const A11yChecklist = {
  // Images
  images: {
    description: 'All images have meaningful alt text',
    example: '<img src="..." alt="Description of image" />',
  },

  // Headings
  headings: {
    description: 'Heading hierarchy is logical (h1, then h2/h3, not h1 to h4)',
    example: 'Use semantic heading tags in order',
  },

  // Links
  links: {
    description: 'Link text is descriptive, not "Click here"',
    example: '<a href="/page">Learn about our mission</a>',
  },

  // Forms
  forms: {
    description: 'Form inputs have associated labels',
    example: '<label htmlFor="email">Email:</label><input id="email" />',
  },

  // Keyboard Navigation
  keyboard: {
    description: 'All interactive elements accessible via keyboard (Tab)',
    example: 'Use semantic HTML or tabIndex for custom components',
  },

  // Color Contrast
  contrast: {
    description: 'Text has sufficient contrast ratio (4.5:1 for normal, 3:1 for large)',
    example: 'Use tools like WebAIM Contrast Checker',
  },

  // ARIA Labels
  aria: {
    description: 'Use ARIA labels for screen reader context when needed',
    example: '<button aria-label="Close menu">×</button>',
  },

  // Focus Indicators
  focus: {
    description: 'Focus visible and clearly indicated for keyboard users',
    example: 'Use :focus-visible in CSS, avoid outline:none',
  },

  // Semantics
  semantics: {
    description: 'Use semantic HTML (button, nav, main, etc) not just divs',
    example: '<button>Action</button> instead of <div onClick>Action</div>',
  },

  // Language
  language: {
    description: 'Page language declared for screen readers',
    example: '<html lang="en">',
  },
}

/**
 * Print accessibility checklist to console
 */
export function printA11yChecklist() {
  console.log('♿ BibleFunLand Accessibility Checklist:')
  Object.entries(A11yChecklist).forEach(([key, value]) => {
    console.log(`  ✓ ${value.description}`)
    console.log(`    Example: ${value.example}`)
  })
}

export default useAccessibilityAudit
