# Legal Notices & Compliance Responsibilities

## 1. Third-Party API Terms (BYOK)
This software operates on a **Bring Your Own Key (BYOK)** basis. The deployer/buyer is solely responsible for:
- Obtaining their own API accounts and keys
- Complying with each provider's Terms of Service
- Paying all associated fees

**Integrated services requiring your own keys:**
- **OpenAI** — You must use your own API key. Reselling API access is prohibited by OpenAI's Terms.
- **Hunter.io** — Optional email verification. Subject to Hunter's rate limits and terms.
- **Clearbit** — Optional enrichment. HubSpot is sunsetting standalone Clearbit APIs; verify availability.
- **Stripe** — Required for billing. You need your own Stripe account.
- **HubSpot / Salesforce** — CRM sync requires your own OAuth credentials.
- **SMTP Provider** — Email delivery requires your own mail server credentials.

## 2. Data Protection (GDPR / CCPA)
If you process personal data of EU or California residents:
- You are the Data Controller. You must establish a lawful basis for processing.
- You must execute your own Data Processing Agreement (DPA) with OpenAI if processing EU personal data through their API.
- Cookie consent tracking is provided, but you must draft your own Privacy Policy and Terms of Service.
- Right-to-erasure and data export endpoints are included, but legal compliance is your responsibility.

## 3. No LinkedIn Scraping
The Proxycurl/LinkedIn scraping integration has been **removed** in v2.1. Do not re-add LinkedIn scraping functionality. LinkedIn actively litigates against unauthorized data scraping, and their User Agreement restrictions survive account termination.

## 4. No Warranty
This software is provided "as-is" under the MIT License. The seller/licensor assumes no liability for how you deploy, configure, or use this software.

## 5. Commercial Use
You may sell, sublicense, or redistribute this source code under MIT License terms. You may NOT:
- Resell OpenAI API access as a service
- Resell Hunter.io, Clearbit, or any third-party API access bundled with this software
- Scrape LinkedIn or other platforms in violation of their terms
