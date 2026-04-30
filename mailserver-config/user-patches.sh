#!/bin/bash
# Runs at every container startup (docker-mailserver hook).
# Copies per-user sieve scripts into each user's maildir with correct ownership
# so Dovecot can compile and execute them.
SIEVE_DIR="/tmp/docker-mailserver/sieve"
MAIL_DIR="/var/mail"

for sieve_file in "${SIEVE_DIR}"/*.sieve; do
  [[ -f "${sieve_file}" ]] || continue
  filename=$(basename "${sieve_file}" .sieve)
  user="${filename%@*}"
  domain="${filename#*@}"
  mail_home="${MAIL_DIR}/${domain}/${user}"

  if [[ -d "${mail_home}" ]]; then
    dest="${mail_home}/.dovecot.sieve"
    cp "${sieve_file}" "${dest}"
    chown docker:docker "${dest}"
    chmod 644 "${dest}"
    # Remove stale compiled binary so Dovecot recompiles with correct permissions
    rm -f "${mail_home}/.dovecot.svbin"
    echo "Installed sieve script for ${filename}"
  fi
done
