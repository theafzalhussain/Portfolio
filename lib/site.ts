/**
 * Site-wide constants that more than one module needs.
 *
 * The resume lives here for a specific reason: its filename was previously
 * hard-coded in three unrelated places (the resume section, the navbar and
 * the confirmation email). Renaming the PDF silently broke all of them with
 * no build error, because a missing file in `public/` is only ever a runtime
 * 404. One constant means a rename is a one-line change.
 */

export const SITE_URL = 'https://www.afzalhussain.tech'

/** Path as served from `public/` — must match the real filename on disk. */
export const RESUME_PATH = '/Afzal-Hussain-Resume.pdf'

/** Name the browser saves it as via the `download` attribute. */
export const RESUME_FILENAME = 'Afzal-Hussain-Resume.pdf'

/** Absolute URL, for contexts with no page origin (emails, OG tags). */
export const RESUME_URL = `${SITE_URL}${RESUME_PATH}`
