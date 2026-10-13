export const site = {
  name: 'myWaive',
  company: 'Waive Ltd',
  domain: 'https://www.mywaive.io',
  tagline: 'Regulated financial advice should be inclusive - affordable, accessible and personalised.',
  description:
    'myWaive delivers AI-enabled, regulated pension and investment advice to members and employees through pension providers, employers and benefits providers.',
  /** Public inbox for the site. */
  hello: 'hello@mywaive.io',
  privacy: 'privacy@mywaive.io',
  companies: [
    { name: 'Waive Ltd', number: '16878413' },
    { name: 'myWaive Ltd', number: '17385164' },
  ],
  registeredOffice: "3 Lloyd's Avenue, London, EC3N 3DS",
  /** Draft compliance wording — requires sign-off before launch. */
  regulatoryStatement:
    'Waive Ltd and myWaive Ltd are technology companies and are not authorised or regulated by the Financial Conduct Authority. Regulated financial advice delivered through the myWaive platform is provided under the permissions of FCA-authorised partner firms, which are responsible for that advice. Information on this website is general and is not financial advice.',
  /**
    * Social profiles. `placeholder: true` means the handle has NOT been confirmed —
    * verify each account exists (or create it) and clear the flag before launch.
    */
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/mywaive-io/posts/?feedView=all', icon: 'linkedin' as const },
  ],
  /** Hosted form endpoint (e.g. Formspree). Leave empty until the client chooses a provider. */
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
};

export type NavItem = { label: string; href: string; children?: { label: string; href: string; desc?: string }[] };

export const industries = [
  {
    label: 'Providers',
    fullLabel: 'Pension Scheme Providers',
    href: '/for-industries/pension-providers',
    desc: 'Personalised advice for your members',
    icon: 'account_balance',
  },
  {
    label: 'Corporates',
    fullLabel: 'Corporates & Employers',
    href: '/for-industries/corporates',
    desc: 'Your employees benefit from every pound of pension spend',
    icon: 'groups',
  },
  {
    label: 'Benefits Providers',
    fullLabel: 'Benefits Providers',
    href: '/for-industries/partners',
    desc: 'Sell regulated advice into corporates under your brand',
    icon: 'handshake',
  },
];

export const nav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'For Industries', href: '/for-industries/pension-providers', children: industries.map(({ label, href, desc }) => ({ label, href, desc })) },
  { label: 'myWaive Product', href: '/product' },
  { label: 'Contact Us', href: '/contact' },
];

export const legalPages = [
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Cookie Policy', href: '/legal/cookie-policy' },
  { label: 'Legal Information', href: '/legal/legal-information' },
  { label: 'Terms of Service', href: '/legal/terms-of-service' },
  { label: 'Modern Slavery Statement', href: '/legal/modern-slavery-statement' },
];

export const cta = {
  primary: { label: 'Book a demo', href: '/contact' },
};
