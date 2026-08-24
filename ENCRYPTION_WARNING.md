# ⚠️ CRITICAL: Encryption Key Backup

The `ENCRYPTION_KEY` environment variable is used to encrypt sensitive data
in your database (e.g., CRM integration tokens, API credentials).

## If You Lose This Key:

- **All encrypted data becomes permanently unrecoverable.**
- There is no "reset password" for encryption keys.
- There is no support ticket that can restore it.
- Migrating to a new server without the key = total data loss.

## Best Practices:

1. **Generate once:** Use `openssl rand -hex 32` and save the output.
2. **Store securely:** Password manager (1Password, Bitwarden) or hardware security module.
3. **Backup offline:** Write it down and store in a physical safe.
4. **Never commit:** Do NOT put this key in Git, GitHub, or any public repository.
5. **Rotate carefully:** Changing the key requires re-encrypting all existing data.

## For Your Clients (Agency License Holders):

If you deploy this for clients, YOU are responsible for their encryption keys.
Document their keys securely. If they lose it, their encrypted data is gone forever.

The seller assumes zero liability for data loss caused by lost encryption keys.
