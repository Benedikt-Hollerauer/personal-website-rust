import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { BackgroundCard } from '../components/BackgroundCard'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { Direction } from '../types'
import styles from './ContactPage.module.css'

type RecaptchaV3Client = {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaV3Client
  }
}

type ContactFormValues = {
  name: string
  email: string
  message: string
}

type SubmitState = 'idle' | 'success' | 'error'

const RECAPTCHA_ACTION = 'contact_form_submit'

let recaptchaScriptPromise: Promise<void> | null = null

async function loadRecaptchaV3(siteKey: string): Promise<void> {
  if (typeof window === 'undefined' || window.grecaptcha) {
    return
  }

  if (!recaptchaScriptPromise) {
    recaptchaScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
      script.async = true
      script.defer = true
      script.onload = () => {
        resolve()
      }
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA v3 script.'))
      }
      document.head.appendChild(script)
    })
  }

  await recaptchaScriptPromise
}

async function getRecaptchaToken(siteKey: string): Promise<string> {
  await loadRecaptchaV3(siteKey)

  const { grecaptcha } = window
  if (!grecaptcha) {
    throw new Error('reCAPTCHA v3 is not available.')
  }

  await new Promise<void>((resolve) => {
    grecaptcha.ready(() => {
      resolve()
    })
  })

  return grecaptcha.execute(siteKey, { action: RECAPTCHA_ACTION })
}

const CONTACT_TOP_ARROW = (
  <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="19 12 12 5 5 12" />
  </svg>
)

const LOCATION_ICON = (
  <svg viewBox="0 0 24 24" width="1.8rem" height="1.8rem" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s-6-5.1-6-10a6 6 0 1 1 12 0c0 4.9-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
)

const EMAIL_ICON = (
  <svg viewBox="0 0 24 24" width="1.8rem" height="1.8rem" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const SEND_ICON = (
  <svg viewBox="0 0 24 24" width="1rem" height="1rem" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 11.8 20 4l-6.8 16-2.3-6-7.9-2.2z" />
  </svg>
)

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="1.35rem" height="1.35rem" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.21.68-.48l-.01-1.7c-2.79.61-3.38-1.18-3.38-1.18-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.84.09-.65.35-1.09.63-1.34-2.23-.25-4.57-1.11-4.57-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.55 9.55 0 0 1 12 6.8a9.6 9.6 0 0 1 2.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.58 4.95.36.3.68.9.68 1.82l-.01 2.69c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
)

const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" width="1.35rem" height="1.35rem" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const LINKEDIN_ICON = (
  <svg viewBox="0 0 24 24" width="1.35rem" height="1.35rem" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8.2 10.2v5.8" />
    <circle cx="8.2" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <path d="M11.4 16v-5.8h2v.8c.37-.58 1.06-.98 2-.98 1.73 0 2.6 1.13 2.6 3.01V16h-2v-2.66c0-.8-.29-1.35-1.03-1.35-.56 0-.89.38-1.04.75-.05.13-.07.31-.07.49V16h-2.46z" fill="currentColor" stroke="none" />
  </svg>
)

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  message: '',
}

const SOCIAL_LINKS: Array<{ label: string; href: string; icon: ReactNode }> = [
  { label: 'GitHub', href: 'https://github.com/benedikt-hollerauer', icon: GITHUB_ICON },
  { label: 'Instagram', href: 'https://instagram.com/bene.hl', icon: INSTAGRAM_ICON },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/benedikt-hollerauer', icon: LINKEDIN_ICON },
]

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ContactPage() {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''

  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [formError, setFormError] = useState('')

  const canSubmit = useMemo(() => {
    const hasValues = values.name.trim() && values.email.trim() && values.message.trim()
    return Boolean(hasValues && recaptchaSiteKey)
  }, [recaptchaSiteKey, values.email, values.message, values.name])

  useEffect(() => {
    if (!recaptchaSiteKey) {
      return
    }

    document.body.classList.add('contactPageBadgeVisible')

    loadRecaptchaV3(recaptchaSiteKey).catch(() => {
      // Submit flow already handles reCAPTCHA load failures.
    })

    return () => {
      document.body.classList.remove('contactPageBadgeVisible')
    }
  }, [recaptchaSiteKey])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setSubmitState('error')
      setFormError('Please fill out name, email, and message.')
      return
    }

    if (!isValidEmail(values.email)) {
      setSubmitState('error')
      setFormError('Please use a valid email address.')
      return
    }

    if (!recaptchaSiteKey) {
      setSubmitState('error')
      setFormError('Missing reCAPTCHA site key. Add VITE_RECAPTCHA_SITE_KEY in .env.')
      return
    }

    setIsSubmitting(true)
    setSubmitState('idle')
    setFormError('')

    try {
      const captchaToken = await getRecaptchaToken(recaptchaSiteKey)

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          captchaToken,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.description || err?.error || 'Unable to send your message right now.')
      }

      setSubmitState('success')
      setValues(INITIAL_VALUES)
    } catch {
      setSubmitState('error')
      setFormError('Message not sent. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.contactPage}>
      <EdgeArrowButton
        to="/"
        ariaLabel="Return to homepage"
        label="Home"
        arrow={CONTACT_TOP_ARROW}
        icon={HOME_ICON}
        direction={Direction.Top}
        asReturnButton
        className={styles.contactPageReturn}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <PageSectionLayout title="Contact" titlePosition="right" navRail="top" className={styles.contactShell}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <BackgroundCard className={styles.contactPanel} size="lg">
              <motion.form
                className={styles.contactForm}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <label className={styles.visuallyHidden} htmlFor="contact-name">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, name: event.target.value }))
                  }}
                  className={styles.textField}
                  placeholder="NAME"
                  required
                />

                <label className={styles.visuallyHidden} htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, email: event.target.value }))
                  }}
                  className={styles.textField}
                  placeholder="EMAIL"
                  required
                />

                <label className={styles.visuallyHidden} htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={8}
                  value={values.message}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, message: event.target.value }))
                  }}
                  className={styles.textArea}
                  placeholder="MESSAGE"
                  required
                />

                {!recaptchaSiteKey && (
                  <div className={styles.captchaFallback}>
                    Add <code>VITE_RECAPTCHA_SITE_KEY</code> to enable spam protection.
                  </div>
                )}

                <button className={styles.submitButton} type="submit" disabled={!canSubmit || isSubmitting}>
                  <span aria-hidden="true">{SEND_ICON}</span>
                  <span>{isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
                </button>

                {submitState === 'success' && <p className={styles.successText}>Message sent. Thank you.</p>}
                {submitState === 'error' && <p className={styles.errorText}>{formError}</p>}
                {!recaptchaSiteKey && (
                  <p className={styles.errorText}>
                    Missing reCAPTCHA site key. Add <code>VITE_RECAPTCHA_SITE_KEY</code> to your frontend env file.
                  </p>
                )}
              </motion.form>

              <motion.aside
                className={styles.contactInfo}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    {LOCATION_ICON}
                  </span>
                  <span className={styles.infoText}>Rosenheim, Bavaria, Germany</span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    {EMAIL_ICON}
                  </span>
                  <a className={styles.infoMail} href="mailto:contact@benedikt-hollerauer.com">
                    contact@benedikt-hollerauer.com
                  </a>
                </div>

                <div className={styles.infoDivider} />

                <div className={styles.socialRow}>
                  {SOCIAL_LINKS.map((link) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      className={styles.socialButton}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className={styles.socialIcon} aria-hidden="true">
                        {link.icon}
                      </span>
                    </motion.a>
                  ))}
                </div>

                <div className={styles.infoDivider} />
                <p className={styles.infoHint}>Feel free to leave me a message</p>
              </motion.aside>
            </BackgroundCard>
          </motion.div>
        </PageSectionLayout>
      </motion.div>
    </main>
  )
}
