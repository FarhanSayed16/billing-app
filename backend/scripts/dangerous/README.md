# Dangerous / one-off admin scripts

These scripts can mutate passwords/PINs or print credentials.

**Do not run against production.**  
**Do not include in deploy images.**

To run locally you must set:

```bash
CONFIRM_DANGEROUS=YES
```

Example:

```bash
cd backend
CONFIRM_DANGEROUS=YES npx ts-node scripts/dangerous/reset_pins.ts
```
