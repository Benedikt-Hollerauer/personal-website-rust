require ["copy"];

# Forward every inbound email to Protonmail.
# Autoreply is handled by the website backend (single source of truth).
redirect :copy "b.hollerauer@proton.me";