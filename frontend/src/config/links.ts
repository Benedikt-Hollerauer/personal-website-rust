function readEnvLink(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

export const APP_LINKS = {
  githubProfile: readEnvLink(
    import.meta.env.VITE_LINK_GITHUB,
    'https://github.com/benedikt-hollerauer',
  ),
  instagramProfile: readEnvLink(
    import.meta.env.VITE_LINK_INSTAGRAM,
    'https://instagram.com/bene.hl',
  ),
  linkedinProfile: readEnvLink(
    import.meta.env.VITE_LINK_LINKEDIN,
    'https://www.linkedin.com/in/benedikt-hollerauer',
  ),
  linkedinSkills: readEnvLink(
    import.meta.env.VITE_LINK_LINKEDIN_SKILLS,
    'https://www.linkedin.com/in/benedikt-hollerauer/details/skills',
  ),
}
