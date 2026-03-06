import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { EdgeArrowButton } from '../components/EdgeArrowButton'
import { HOME_ICON } from '../components/EdgeArrowNav'
import { PageSectionLayout } from '../components/PageSectionLayout'
import { Direction } from '../types'
import styles from './ContactPage.module.css'

type ContactFormValues = {
  name: string
  email: string
  message: string
}

type SubmitState = 'idle' | 'success' | 'error'

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

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  message: '',
}

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/benedikt-hollerauer', icon: 'GH' },
  { label: 'Instagram', href: 'https://instagram.com/benedikt.hollerauer', icon: 'IG' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/benedikt-hollerauer', icon: 'IN' },
]

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ContactPage() {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null)
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''

  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [formError, setFormError] = useState('')

  const canSubmit = useMemo(() => {
    const hasValues = values.name.trim() && values.email.trim() && values.message.trim()
    return Boolean(hasValues && captchaToken && recaptchaSiteKey)
  }, [captchaToken, recaptchaSiteKey, values.email, values.message, values.name])

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

    if (!captchaToken) {
      setSubmitState('error')
      setFormError('Please complete reCAPTCHA before sending.')
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
        throw new Error('Unable to send your message right now.')
      }

      setSubmitState('success')
      setValues(INITIAL_VALUES)
      setCaptchaToken(null)
      recaptchaRef.current?.reset()
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
        className={styles.contactPageReturn}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <PageSectionLayout title="Contact" titlePosition="right" className={styles.contactShell}>
          <motion.section
            className={styles.contactPanel}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
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

              {recaptchaSiteKey ? (
                <div className={styles.captchaWrap}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={recaptchaSiteKey}
                    onChange={(token: string | null) => {
                      setCaptchaToken(token)
                    }}
                  />
                </div>
              ) : (
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
                    whileHover={{ y: -4, scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                  </motion.a>
                ))}
              </div>

              <div className={styles.infoDivider} />
              <p className={styles.infoHint}>Feel free to leave me a message</p>
            </motion.aside>
          </motion.section>
        </PageSectionLayout>
      </motion.div>
    </main>
  )
}
