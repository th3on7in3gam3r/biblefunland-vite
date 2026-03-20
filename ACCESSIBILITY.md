# Accessibility (A11y) Guidelines

This document outlines accessibility best practices for BibleFunLand to ensure our platform is inclusive for all users, including those using assistive technologies.

## Quick Checklist

- [ ] All images have meaningful `alt` text
- [ ] Heading hierarchy is logical (h1, then h2/h3, etc.)
- [ ] Link text is descriptive (not "click here")
- [ ] Form inputs have associated `<label>` elements
- [ ] All interactive elements work with keyboard (Tab, Enter, Escape)
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast (4.5:1 for normal, 3:1 for large)
- [ ] ARIA labels used when semantic HTML isn't enough
- [ ] Focus indicators are visible
- [ ] Page language is declared in HTML

## 1. Images

**Always include meaningful alt text:**

```jsx
// ❌ Bad
<img src="bible.png" />

// ✅ Good
<img src="bible.png" alt="Open Bible with reading glasses" />
```

**For decorative images:**

```jsx
// Empty alt text for purely decorative images
<img src="decorative-line.svg" alt="" />
```

## 2. Headings

**Use semantic heading hierarchy:**

```jsx
// ❌ Bad - Jumping from h1 to h4
<h1>Main Title</h1>
<h4>Section</h4>

// ✅ Good - Logical progression
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

**Never skip heading levels** - screen readers rely on consistent structure.

## 3. Links

**Use descriptive link text:**

```jsx
// ❌ Bad
<a href="/prayers">Click here</a>

// ✅ Good
<a href="/prayers">View community prayers</a>
```

## 4. Forms

**Always associate labels with inputs:**

```jsx
// ❌ Bad
<label>Email:</label>
<input type="email" />

// ✅ Good
<label htmlFor="email">Email:</label>
<input id="email" type="email" />
```

**Mark required fields:**

```jsx
<label htmlFor="name">
  Name: <span aria-label="required">*</span>
</label>
<input id="name" required />
```

## 5. Keyboard Navigation

**All interactive elements must work with Tab key:**

```jsx
// ✅ Native button (works with Tab automatically)
<button onClick={handleClick}>Submit</button>

// ✅ Custom element with keyboard support
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick()
  }}
>
  Submit
</div>
```

**Avoid using `tabIndex={0}` on elements that don't need focus.**

## 6. Color & Contrast

**Don't rely on color alone:**

```jsx
// ❌ Bad - Only uses color to show error
<input style={{ borderColor: '#ff0000' }} />

// ✅ Good - Color + text + icon
<div style={{ color: 'red' }}>
  ❌ Email is invalid
</div>
```

**Test contrast ratios:**
- Normal text: 4.5:1 ratio (AAA standard)
- Large text (18pt+): 3:1 ratio
- Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 7. ARIA (Accessible Rich Internet Applications)

**Use ARIA for custom components:**

```jsx
// Screen reader context for icon button
<button aria-label="Close menu">
  <X size={20} />
</button>

// Mark current page in navigation
<a href="/prayers" aria-current="page">
  Prayers
</a>

// Hidden text for screen readers
<span className="sr-only">Loading content...</span>
```

**ARIA labels should be concise and descriptive.**

## 8. Focus Indicators

**Always show focus visible:**

```css
/* ✅ Good - Show focus clearly */
button:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

/* ❌ Bad - Hidden focus */
button:focus {
  outline: none;
}
```

## 9. Semantic HTML

**Prefer semantic elements:**

```jsx
// ❌ Bad
<div onClick={handleNavigate}>Contact Us</div>

// ✅ Good
<a href="/contact">Contact Us</a>

// ❌ Bad
<div role="button" onClick={handleClick}>Submit</div>

// ✅ Good
<button onClick={handleClick}>Submit</button>
```

## 10. Screen Reader Testing

**Test with common screen readers:**
- Windows: NVDA (free), JAWS
- Mac: VoiceOver (built-in)
- Mobile: TalkBack (Android), VoiceOver (iOS)

**Common testing patterns:**

```bash
# Run accessibility audit in development
npm run test:a11y

# Check for violations
npm run lint
```

## Tools & Resources

### Automated Testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Accessibility Audit Checklist

Before submitting a component, verify:

- [ ] Images have descriptive alt text
- [ ] Headings follow logical order
- [ ] Links have descriptive text
- [ ] Form labels are associated with inputs
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] Focus indicators are visible
- [ ] ARIA labels used appropriately
- [ ] No keyboard traps (can tab out of all elements)
- [ ] Page language is declared

## Common Mistakes

| Mistake | Solution |
|---------|----------|
| Missing alt text on images | Use meaningful descriptions |
| Skipped heading levels | Use h1, h2, h3 in order |
| "Click here" links | Use descriptive link text |
| Unlabeled form fields | Add `<label htmlFor>` to inputs |
| onKeyDown not handled | Add keyboard event handlers for custom buttons |
| No focus indicators | Add :focus-visible styling |
| Color-only information | Add text, icons, or patterns |
| Nested interactive elements | Structure properly, avoid nesting |
| `role="button"` on link | Use `<button>` or `<a>` appropriately |
| Missing page language | Add `lang="en"` to `<html>` |

## Questions?

For accessibility questions or to report issues, please contact the development team or open an issue on GitHub with the label `a11y`.
