# Deployment checklist

- Use Node.js 20.9+ and set environment variables in the deployment dashboard.
- Run `npm ci` where a lockfile is present, otherwise `npm install`; run `npm run build`.
- Apply `supabase/schema.sql`, then optional migration files in order.
- Never expose the service-role key or HMAC secret to the browser.
- Deploy the contract to a testnet first; set address and chain ID; test wallet/network mismatch.
- Enable authentication and role-based access before sharing a public URL.
- Configure external monitoring and backups.
