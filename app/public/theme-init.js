// Apply the saved theme before first paint to avoid a light flash in dark mode.
// Kept as a file (not inline in index.html) so the CSP can forbid inline scripts.
try {
  var saved = localStorage.getItem('as-theme')
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  if (dark) document.documentElement.classList.add('dark')
} catch {}
