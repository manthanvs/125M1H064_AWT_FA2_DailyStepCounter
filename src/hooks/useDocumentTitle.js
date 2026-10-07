import { useEffect } from 'react'

const BASE_TITLE = 'Daily Step Counter'

/**
 * useDocumentTitle - sets the browser tab title for the current page.
 *
 * With routing in place the tab title should say which screen the user is on.
 * The cleanup function restores the base title when the component unmounts, so
 * a page never leaves its title behind after the user navigates away.
 *
 * @param {string} title - the page name, or nothing for the base title
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE
    return () => { document.title = BASE_TITLE }
  }, [title])
}

export default useDocumentTitle
