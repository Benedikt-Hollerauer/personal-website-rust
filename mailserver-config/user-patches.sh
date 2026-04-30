#!/bin/bash
# Runs at every container startup (docker-mailserver hook).
# Links per-user sieve scripts into each user's mail home directory.
SIEVE_DIR="/tmp/docker-mailserver/sieve"
MAIL_DIR="/var/mail"

for sieve_file in "${SIEVE_DIR}"/*.sieve; do
  [[ -f "${sieve_file}" ]] || continue
  filename=$(basename "${sieve_file}" .sieve)
  user="${filename%@*}"
  domain="${filename#*@}"
  mail_home="${MAIL_DIR}/${domain}/${user}"
  if [[ -d "${mail_home}" ]]; then
    ln -sf "${sieve_file}" "${mail_home}/.dovecot.sieve"
    echo "Linked sieve script for ${filename}"
  fi
done
