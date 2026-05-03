#!/bin/bash
# Runs at every container startup (docker-mailserver hook).

# Prefer IPv4 for outbound SMTP delivery so domains without AAAA records don't
# cause hard bounces. Falls back to IPv6 if IPv4 is unavailable.
postconf -e 'smtp_address_preference = ipv4'

# Copies per-user sieve scripts into each user's maildir with correct ownership
# so Dovecot can compile and execute them.
SIEVE_DIR="/tmp/docker-mailserver/sieve"
MAIL_DIR="/var/mail"

for sieve_file in "${SIEVE_DIR}"/*.sieve; do
  [[ -f "${sieve_file}" ]] || continue
  filename=$(basename "${sieve_file}" .sieve)
  user="${filename%@*}"
  domain="${filename#*@}"
  # Dovecot home is /var/mail/<domain>/<user>/home (mail_home = /var/mail/%d/%n/home/)
  user_home="${MAIL_DIR}/${domain}/${user}/home"

  if [[ -d "${MAIL_DIR}/${domain}/${user}" ]]; then
    mkdir -p "${user_home}"
    dest="${user_home}/.dovecot.sieve"
    cp "${sieve_file}" "${dest}"
    chown docker:docker "${dest}"
    chmod 644 "${dest}"
    # Remove stale compiled binary so Dovecot recompiles with correct permissions
    rm -f "${user_home}/.dovecot.svbin"
    echo "Installed sieve script for ${filename}"
  fi
done
