/**
 * Footer - project attribution shown at the bottom of the page.
 *
 * Demonstrates: props with default values and simple JSX composition.
 */

function Footer({
  studentName = 'Sankpal Manthan Vijay',
  prn = '125M1H064',
  subject = 'Advanced Web Technologies',
  phase = 'Mini Project Phase II'
}) {
  return (
    <footer className="app-footer">
      <p className="app-footer__line">
        <strong>{studentName}</strong> &middot; PRN {prn}
      </p>
      <p className="app-footer__line app-footer__line--muted">
        {subject} &middot; {phase} &middot; SYMCA 2026-27
      </p>
    </footer>
  )
}

export default Footer
