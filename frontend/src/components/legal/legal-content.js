export const LEGAL_REVIEW_MARKER = 'Draft: awaiting organizer and legal review';

export const legalContent = {
  privacy: {
    eyebrow: 'Legal and privacy',
    title: 'Privacy Policy',
    summary: 'This draft records what the current website code shows about personal information and connected services. It remains subject to organizer and legal review before publication.',
    sections: [
      {
        id: 'privacy-scope',
        title: 'Scope',
        paragraphs: [
          'The website presents information about the IEEE Student Branch at Graphic Era Hill University, Dehradun, including events, team profiles, public member pages, and a contact form. This draft describes the public frontend and the API behavior reviewed in this repository.',
        ],
      },
      {
        id: 'privacy-information',
        title: 'Information you provide',
        paragraphs: [
          'The contact form currently asks for first name, last name, email address, and message. When submitted, the browser sends those fields as JSON to the backend at /api/contact.',
          'The current contact endpoint writes the submitted request details to the backend server logs and returns a confirmation to the browser. It does not send an email, and the reviewed code does not show a contact record store or email delivery step.',
        ],
      },
      {
        id: 'privacy-purposes',
        title: 'Purposes and public information',
        paragraphs: [
          'Authorized administrators manage public profiles and events so the website can present branch information, event details, and approved information about members and activities. These records are intended for public display rather than private account use.',
          'Team profiles may include name, role, category, image, short bio, committee, academic year, branch, year, skills, interests, achievements, lead status, rank, order, and selected social links. The public API does not accept personal email or phone fields for team profiles. The person or group responsible for approving public information remains to be confirmed.',
        ],
      },
      {
        id: 'privacy-qr',
        title: 'Public profile QR codes',
        paragraphs: [
          'A public profile QR code encodes the URL of that public profile only. It does not place the profile details themselves inside the QR code.',
        ],
      },
      {
        id: 'privacy-theme-analytics',
        title: 'Theme preference and analytics',
        paragraphs: [
          'A manually selected theme is stored in browser localStorage under the key ieee-theme. When there is no manual selection, the frontend reads the browser system preference using prefers-color-scheme and can follow later system theme changes.',
          'The theme preference is used for display and is not used for analytics. No analytics SDK was identified in the reviewed frontend source.',
        ],
      },
      {
        id: 'privacy-services',
        title: 'Technical and third-party services',
        paragraphs: [
          'The frontend imports Space Grotesk and Inter from Google Fonts at fonts.googleapis.com. It also requests a decorative noise asset from grainy-gradients.vercel.app/noise.svg and uses image URLs from Unsplash in the page source and event fallbacks.',
          'The backend is configured to send uploaded event and team images to Cloudinary. The URL returned by Cloudinary can then be stored with the corresponding content record.',
          'The backend is built to use MongoDB through Mongoose for event, team, and admin records. The deployment configuration names Vercel for hosting both the website and its API. The reviewed deployment files do not establish provider log retention, backup periods, processing locations, or contractual terms.',
          'No cookie banner or browser cookie implementation was identified in the reviewed frontend source. Hosting, browser, and service-provider logs still require confirmation.',
        ],
      },
      {
        id: 'privacy-security',
        title: 'Administrative security',
        paragraphs: [
          'Admin credentials are handled with bcrypt password hashing and comparison. The admin sign-in endpoint returns a JSON Web Token (JWT), and the frontend stores that token in browser localStorage under the key adminToken for authenticated admin requests. This storage behavior applies to the administrative interface, not to ordinary public browsing.',
          "Volunteers authorized by an administrator can sign in with Google. Google's sign-in script loads only where the button appears, and the website receives the account's email address and Google account identifier to match it against the authorized email. The member token is then stored in localStorage under memberToken. Google's own privacy policy applies to the sign-in process.",
          'The backend applies rate limiting to API requests and uses a stricter limiter for admin login attempts. These measures reduce risk, but no absolute security guarantee is made.',
        ],
      },
      {
        id: 'privacy-retention',
        title: 'Retention',
        paragraphs: [
          'No retention period is stated in the reviewed source code or deployment files. Retention for submitted contact details in server logs, database records and backups, Cloudinary assets, authentication records, and hosting logs is unresolved.',
          'The organizer and legal reviewer must confirm retention periods, deletion practices, backup handling, and who can access each category before this notice is treated as final.',
        ],
      },
      {
        id: 'privacy-controller',
        title: 'Data controller and ownership',
        paragraphs: [
          'The legal entity or person that decides why and how personal information is processed has not been confirmed. This notice does not identify a controller, owner, or institutional privacy office until the organizer and legal reviewer approve that description.',
        ],
      },
      {
        id: 'privacy-rights',
        title: 'Requests and review status',
        paragraphs: [
          'The rights available to people who submit information, any identity checks, response timeframes, and the process for access, correction, deletion, or other requests have not been confirmed. No rights claim or request deadline is made in this draft.',
        ],
      },
      {
        id: 'privacy-contact',
        title: 'Contact and review status',
        paragraphs: [
          {
            before: 'For general enquiries, email ',
            href: 'mailto:ieee@gehu.ac.in',
            label: 'ieee@gehu.ac.in',
            after: '. Whether this mailbox is owned or monitored by the person responsible for privacy, or can receive rights requests, is unconfirmed.',
          },
          'Contact ownership, escalation, and the final privacy contact must be confirmed by the organizer and legal reviewer before publication.',
        ],
      },
      {
        id: 'privacy-review-checklist',
        title: 'Organizer review checklist',
        paragraphs: [
          'The organizer and legal reviewer must confirm the legal entity and data controller, the owner of the general and privacy contact address, the applicable rights and request process, retention and deletion practices, backup handling, access responsibilities, and the final wording before this draft is treated as final.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Legal and use',
    title: 'Terms and Conditions',
    summary: 'This draft describes the website and practical rules for using it. It remains subject to organizer and legal review and does not add unreviewed legal promises.',
    sections: [
      {
        id: 'terms-purpose',
        title: 'Site purpose',
        paragraphs: [
          'The website is used to present information about the IEEE Student Branch at Graphic Era Hill University, Dehradun, including branch information, events, team profiles, and ways to contact the branch.',
        ],
      },
      {
        id: 'terms-acceptable-use',
        title: 'Acceptable use',
        paragraphs: [
          'Visitors may use the public pages to learn about the branch, its events, its activities, and its published profiles. Use the contact form for legitimate enquiries and do not submit passwords, financial details, or other sensitive information that is not needed for the enquiry.',
          'Do not attempt unauthorized access to administrative pages or APIs, bypass authentication or other controls, submit abusive or disruptive requests, evade rate limits, interfere with the service, or misuse the contact endpoint.',
        ],
      },
      {
        id: 'terms-content',
        title: 'Website content',
        paragraphs: [
          'Events, dates, descriptions, registration links, team profiles, images, and other content are loaded from the website backend or included in the frontend. Content may change as the site is maintained. The source code does not document a service availability guarantee or error-free operation.',
          'Some images are loaded from Unsplash or returned by Cloudinary. The permissions, attribution requirements, and ownership review for each published asset remain organizer review items.',
        ],
      },
      {
        id: 'terms-contact',
        title: 'Contact form',
        paragraphs: [
          'The contact form sends first name, last name, email address, and message to /api/contact. The current backend logs the submitted request details to its server console and returns a confirmation message. The reviewed route does not show a contact record store or a mail delivery integration.',
          'The current endpoint records the submitted request details in backend server logs and returns a confirmation to the browser. It does not deliver the message by email. Because the submitted details are logged, only information needed for a legitimate enquiry should be sent.',
        ],
      },
      {
        id: 'terms-profiles',
        title: 'Public profiles and submissions',
        paragraphs: [
          'Only authorized administrators should create or update public profiles and events. Submissions should be accurate, kept current by the responsible administrator, and limited to information approved for public display. The profile approval process and any permissions needed for submitted names, images, or social links remain organizer review items.',
          'The authenticated admin API accepts optional team profile fields such as name, role, category, image, short bio, committee, academic year, branch, year, skills, interests, achievements, lead status, rank, order, and selected social links. It does not accept personal email or phone fields for team profiles.',
        ],
      },
      {
        id: 'terms-branding',
        title: 'Names, logos, and branding',
        paragraphs: [
          'IEEE and Graphic Era Hill University names, logos, and other marks may be owned by their respective organizations. Ownership, permitted uses, and any required approvals remain pending organizer and legal review. Nothing on this website grants an implied trademark license.',
        ],
      },
      {
        id: 'terms-admin',
        title: 'Administrative interface',
        paragraphs: [
          'The repository includes a restricted admin interface. Only authorized administrators should use it. A successful sign-in returns a JSON Web Token (JWT), and the frontend stores it in localStorage under adminToken for later authenticated requests. Access rules, account ownership, and administrator responsibilities require organizer confirmation.',
        ],
      },
      {
        id: 'terms-external-links',
        title: 'External links and services',
        paragraphs: [
          'The website links to external IEEE sites and references Google Fonts, a decorative noise asset hosted at grainy-gradients.vercel.app, image URLs from Unsplash, Cloudinary image storage, MongoDB through Mongoose, and Vercel hosting. External destinations and providers may have their own content, privacy, security, and use policies.',
          'The branch does not set the policies of external destinations. External content, links, availability, provider terms, asset licenses, logs, backups, regions, and account ownership have not been fully reviewed for this website.',
        ],
      },
      {
        id: 'terms-review',
        title: 'Unresolved terms for review',
        paragraphs: [
          'The organizer and legal reviewer must confirm the legal entity and site owner, acceptable-use rules, administrator authorization, profile submission and accuracy responsibilities, branding permissions, external-link policy, privacy contact and request process, retention practices, and any other final legal terms.',
          'This draft intentionally does not state a governing law, liability allocation, warranty, dispute process, termination rule, or other contractual promise.',
        ],
      },
      {
        id: 'terms-contact-review',
        title: 'Contact and review status',
        paragraphs: [
          {
            before: 'For general enquiries about this draft, email ',
            href: 'mailto:ieee@gehu.ac.in',
            label: 'ieee@gehu.ac.in',
            after: '. Whether this mailbox is the approved legal or privacy contact is unconfirmed.',
          },
          'The organizer and legal reviewer must confirm contact ownership before publication.',
        ],
      },
    ],
  },
};

export const getLegalContent = (kind = 'privacy') => (
  legalContent[kind] || legalContent.privacy
);
