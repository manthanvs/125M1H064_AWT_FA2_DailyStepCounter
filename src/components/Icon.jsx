/**
 * Icon - a tiny presentational component that renders one inline SVG icon.
 *
 * Keeping the icon paths in a single lookup object avoids repeating SVG markup
 * across the application and gives every other component a simple prop-driven
 * API: <Icon name="flame" />
 *
 * Demonstrates: props, destructuring with default values, and returning JSX.
 */

const ICON_PATHS = {
  map: 'M9 20l-5.5 2.5V6L9 3.5m0 16.5l6-3m-6 3V3.5m6 13.5l5.5 2.5V4L15 6.5m0 10.5V6.5m0 0L9 3.5',
  flame: 'M12 22c3.9 0 6.5-2.5 6.5-6 0-4-3.5-6-4.5-9.5C13 9 11.5 9.5 10 11c0-2-.5-3.5-1.5-4.5C7 9 5.5 11 5.5 16c0 3.5 2.6 6 6.5 6z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3.5 2',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  trophy: 'M8 4h8v5a4 4 0 01-8 0V4zm-3 1h3v3a3 3 0 01-3-3zm14 0h-3v3a3 3 0 003-3zM10 17h4m-2-4v4m-3 4h6',
  plus: 'M12 6v12M6 12h12',
  reset: 'M4 12a8 8 0 108-8 8 8 0 00-6.6 3.5M4 4v4h4',
  trash: 'M5 7h14M10 7V5h4v2m-7 0l1 12h8l1-12',
  walk: 'M13 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM11 21l1.5-5L10 14l1-5.5L8 10l-1 3m6.5-.5L16 15l1 6',
  pencil: 'M4 20h4l10-10a2.8 2.8 0 10-4-4L4 16v4z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zm5-2l4 4',
  chart: 'M4 20V10m5 10V4m5 16v-7m5 7V8'
}

function Icon({ name = 'target', size = 20, className = '' }) {
  // Fall back to a neutral icon if an unknown name is supplied.
  const path = ICON_PATHS[name] ?? ICON_PATHS.target

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}

export default Icon
