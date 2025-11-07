# Email Notifications Setup Guide

This guide will help you set up email notifications for membership requests using your Gmail account.

---

## 📧 **What Gets Sent**

When someone submits a membership request on your website, **TWO emails** are automatically sent:

### **1. Notification to Board Members**
- ✅ Email notification sent to board members (ADMIN and BOARD roles)
- ✅ Includes applicant's name, email, phone, residence status, motivation
- ✅ Direct link to admin panel to review the request
- ✅ Beautiful Swedish Brand-themed email template

### **2. Welcome Email to Applicant** ⭐
- ✅ Automatic confirmation email sent to the applicant
- ✅ **Multilingual support** - Sent in the language they used on the website (EN/SV/KM)
- ✅ Includes:
  - Thank you message and application received confirmation
  - Reference number for tracking
  - Timeline for review process (7-14 days)
  - Links to explore website, blog, and events
  - Professional Swedish Brand design with logo
- ✅ Encourages engagement while waiting for approval

### **3. Approval Email to Applicant** ⭐ NEW
- ✅ Automatically sent when board approves the request
- ✅ **Multilingual support** - Sent in the applicant's preferred language
- ✅ Includes:
  - Congratulations message
  - Member number assigned
  - Reference number for tracking
  - Link to visit the website
  - Professional Swedish Brand design with logo

### **🔄 Email Retry Feature** ⭐ NEW
Board members and admins can manually resend emails from the admin panel:
- ✅ Resend welcome email if applicant didn't receive it
- ✅ Resend approval email if member didn't receive it (only for approved requests)
- ✅ Visual feedback when emails are sent
- ✅ Access via "Email Notifications" card in membership request detail page

---

## 🔐 **Step 1: Create Gmail App Password**

Google requires you to create an "App Password" (not your regular Gmail password) for apps to send emails.

### **Instructions:**

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/apppasswords
   - You may need to sign in with your Gmail account

2. **Enable 2-Step Verification (if not already enabled):**
   - If you see "2-Step Verification is not turned on", click to enable it first
   - Follow the prompts to set up 2-Step Verification
   - Return to: https://myaccount.google.com/apppasswords

3. **Create App Password:**
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other (Custom name)"
   - Type: `Sahakum Khmer Website`
   - Click "Generate"

4. **Copy the 16-character password:**
   - You'll see a yellow box with a 16-character password like: `abcd efgh ijkl mnop`
   - **IMPORTANT:** Copy this password immediately - you won't be able to see it again!
   - Remove spaces when using it: `abcdefghijklmnop`

---

## 💻 **Step 2: Set Up Local Development (Optional)**

If you want to test email notifications locally:

1. **Copy `.env.example` to `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your email configuration to `.env.local`:**
   ```env
   # Email configuration
   EMAIL_FROM="contact.sahakumkhmer.se@gmail.com"
   EMAIL_APP_PASSWORD="abcdefghijklmnop"  # Your 16-char App Password (no spaces)

   # Optional: Specific email addresses to notify (comma-separated)
   # If not set, sends to all ADMIN and BOARD users in database
   MEMBERSHIP_NOTIFICATION_EMAILS="board1@example.com,board2@example.com"
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## 🚀 **Step 3: Configure Vercel Production**

### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to your Vercel project:**
   - Visit: https://vercel.com/dashboard
   - Select your `sahakum-khmer-se` project

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

3. **Add the following environment variables:**

   **Variable 1: EMAIL_FROM**
   - Key: `EMAIL_FROM`
   - Value: `contact.sahakumkhmer.se@gmail.com`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2: EMAIL_APP_PASSWORD**
   - Key: `EMAIL_APP_PASSWORD`
   - Value: `abcdefghijklmnop` (your 16-char App Password, no spaces)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 3: MEMBERSHIP_NOTIFICATION_EMAILS (Optional)**
   - Key: `MEMBERSHIP_NOTIFICATION_EMAILS`
   - Value: `board1@example.com,board2@example.com` (comma-separated)
   - Environment: ✅ Production
   - Click "Save"

4. **Redeploy your application:**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

### **Option B: Via Vercel CLI**

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (if not already linked)
vercel link

# Add environment variables
vercel env add EMAIL_FROM
# When prompted, enter: contact.sahakumkhmer.se@gmail.com
# Select: Production, Preview, Development

vercel env add EMAIL_APP_PASSWORD
# When prompted, enter: abcdefghijklmnop (your 16-char password)
# Select: Production, Preview, Development

vercel env add MEMBERSHIP_NOTIFICATION_EMAILS
# When prompted, enter: board1@example.com,board2@example.com
# Select: Production

# Redeploy
vercel --prod
```

---

## ✅ **Step 4: Test Email Notifications**

### **Test in Production:**

1. Go to your live website: https://www.sahakumkhmer.se/en/join
2. Fill out the membership request form
3. Submit the form
4. Check the email inbox(es) you configured
5. You should receive an email with:
   - Subject: "New Membership Request: [Name]"
   - Swedish Brand colors (navy and gold)
   - All applicant details
   - Button linking to admin panel

### **Check Admin Panel:**

1. Go to: https://www.sahakumkhmer.se/en/admin/membership-requests
2. Login with admin credentials
3. You should see the new request
4. The email link should take you directly to the request details

---

## 🔄 **Step 5: Using the Email Retry Feature**

If an applicant reports they didn't receive an email, you can manually resend it from the admin panel.

### **How to Resend Emails:**

1. **Navigate to Membership Request:**
   - Go to: `/en/admin/membership-requests`
   - Click on the specific request you want to manage

2. **Find the "Email Notifications" Card:**
   - On the right sidebar, you'll see a card titled "Email Notifications"
   - It shows the applicant's email address

3. **Resend Welcome Email:**
   - Click the "Resend Welcome Email" button (blue)
   - This sends the initial confirmation email again
   - Works for any request status

4. **Resend Approval Email** (only for approved requests):
   - Click the "Resend Approval Email" button (green)
   - Only visible when request status is APPROVED
   - Sends the congratulations email with member number

5. **Check for Success:**
   - A blue success alert will appear: "Welcome email sent successfully to [email]"
   - Or: "Approval email sent successfully to [email]"
   - Success messages auto-disappear after 5 seconds

6. **Handle Errors:**
   - If sending fails, a red error alert will appear
   - Error messages auto-disappear after 8 seconds
   - Check email configuration if errors persist

### **Common Scenarios:**

**Scenario 1**: Applicant didn't receive welcome email
- Action: Click "Resend Welcome Email"
- Result: Confirmation email sent in their preferred language

**Scenario 2**: Approved member didn't receive approval email
- Action: Click "Resend Approval Email"
- Result: Congratulations email sent with member number

**Scenario 3**: Email went to spam folder
- Action: Resend email, ask applicant to check spam
- Result: Fresh email may avoid spam filters

---

## 📝 **How It Works**

### **Email Recipients:**

The system determines who receives notifications in this order:

1. **If `MEMBERSHIP_NOTIFICATION_EMAILS` is set:**
   - Sends to those specific email addresses
   - Example: `board1@example.com,board2@example.com`

2. **If NOT set:**
   - Automatically sends to all users in database with role:
     - `ADMIN`
     - `BOARD`
   - Only sends to active users (`active: true`)

### **Email Template:**

The email uses Swedish Brand colors and includes:
- **Header:** Navy background with gold accent
- **Alert Badge:** Gold background indicating new request
- **Applicant Details:** Clean table layout
- **Motivation Section:** Highlighted with gold border
- **Review Button:** Gold button linking to admin panel
- **Footer:** Professional branding

---

## 🔧 **Troubleshooting**

### **Problem: Emails not being sent**

1. **Check Vercel logs:**
   ```bash
   vercel logs
   ```
   Look for errors mentioning "email" or "nodemailer"

2. **Verify environment variables are set:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Confirm `EMAIL_FROM` and `EMAIL_APP_PASSWORD` exist

3. **Check Gmail App Password:**
   - Make sure you copied the entire 16-character password
   - Remove any spaces: `abcdefghijklmnop` (not `abcd efgh ijkl mnop`)
   - Try generating a new App Password if it doesn't work

4. **Check console logs:**
   - Membership requests are still created even if email fails
   - Email errors are logged but don't block the request

### **Problem: Gmail blocking sign-in**

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Use App Password (not regular password):**
   - Regular Gmail password won't work
   - Must use App Password from: https://myaccount.google.com/apppasswords

3. **Check "Less secure app access" (older accounts):**
   - This setting is deprecated, use App Password instead

### **Problem: Wrong recipients**

- If emails are going to wrong people, set `MEMBERSHIP_NOTIFICATION_EMAILS`:
  ```env
  MEMBERSHIP_NOTIFICATION_EMAILS="correct1@example.com,correct2@example.com"
  ```

- Or update board member emails in database:
  - Go to: `/en/admin/users`
  - Update email addresses for ADMIN and BOARD users

---

## 🔒 **Security Notes**

1. **Never commit `.env.local` to git:**
   - Already in `.gitignore`
   - Contains sensitive App Password

2. **App Password is safer than regular password:**
   - Can be revoked anytime from: https://myaccount.google.com/apppasswords
   - Only has access to send emails, not read or delete

3. **Vercel environment variables are encrypted:**
   - Stored securely in Vercel
   - Not visible in git or public logs

4. **Email sending is graceful:**
   - If email fails, membership request is still created
   - Board can still see requests in admin panel
   - Email failure won't break the website

---

## 📚 **Additional Resources**

- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **Nodemailer Documentation:** https://nodemailer.com/about/

---

## 🌍 **Multilingual Email Support**

The system automatically detects the language used by the applicant when filling out the form and sends the welcome email in their preferred language:

- **English (en)**: Default language
- **Swedish (sv)**: For Swedish applicants
- **Khmer (km)**: For Khmer-speaking community members

### **How It Works:**
1. User visits `/en/join`, `/sv/join`, or `/km/join`
2. Form automatically captures the language preference
3. Welcome email is sent in that language
4. Board notification is always in English (admin interface is English-only)

### **Email Content Includes:**
- Personalized greeting with applicant's name (including Khmer name if provided)
- Sahakum Khmer logo and branding
- Application received confirmation with reference number
- Expected timeline (7-14 days)
- Links to website, blog, and events (in their language)
- Closing message encouraging engagement

---

## ✨ **What's Next?**

After setting up email notifications, you can:

1. **Customize the email templates:**
   - Edit: `src/lib/email-templates.ts`
   - Change colors, layout, or content
   - Modify translations for each language

2. **Add more notification types:**
   The email system is designed to be reusable. You can easily add:
   - ✅ **Welcome emails** (implemented)
   - ✅ **Approval notifications** (implemented)
   - 📋 Rejection notifications
   - 📋 Event registrations
   - 📋 Contact form submissions
   - 📋 Board member applications

3. **Extend multilingual support:**
   - Add more languages to `EMAIL_CONTENT` in `email-templates.ts`
   - Follow the existing structure for consistency

4. **Set up email analytics:**
   - Track email open rates
   - Monitor delivery success
   - Analyze engagement by language

---

## 🔄 **Reusable Email System**

The email template system is built to be extensible:

```typescript
// Email translations are centralized
const EMAIL_CONTENT: Record<Language, EmailTranslations> = {
  en: { welcome: {...}, approval: {...} },
  sv: { welcome: {...}, approval: {...} },
  km: { welcome: {...}, approval: {...} }
}

// Easy to add new templates
export function generateApprovalEmail(data) { ... }
export function generateRejectionEmail(data) { ... }
export function generateEventInvitationEmail(data) { ... }
```

**Benefits:**
- ✅ Consistent branding across all emails
- ✅ Easy to maintain and update
- ✅ Multilingual by default
- ✅ Type-safe with TypeScript
- ✅ Responsive HTML email templates

---

**Need help?** Check the troubleshooting section above or contact your developer.
