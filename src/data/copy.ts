/** Canonical copy blocks — see context/contect_architecure/04-content-inventory.md §A */

export const features = [
  { icon: 'phone_iphone', screen: 'dashboard', title: 'Engaging digital experience', text: 'Clear, straight-forward advice and engaging user experience.', card: { label: 'Your pension', value: '£84,200', note: 'On track for age 67' } },
  { icon: 'calculate', screen: 'modeller', title: 'Financial modellers', text: 'Contribution and retirement modellers that show the impact of every choice.', card: { label: 'Contribution calculator', value: '+£50/mo', note: '= £31k more at retirement' } },
  { icon: 'verified_user', screen: 'advice', title: 'Regulated retirement advice', text: 'Personalised, compliant recommendations validated against FCA rules.', card: { label: 'Recommendation', value: 'Ready', note: 'Validated · fully logged' } },
  { icon: 'merge', screen: 'consolidation', title: 'Pensions consolidation', text: 'Pension transfer advice that brings scattered pots into one place.', card: { label: 'Pots found', value: '3', note: 'Transfer advice available' } },
  { icon: 'school', screen: 'education', title: 'Tailored financial education', text: 'Bite-size learning matched to each member’s circumstances.', card: { label: 'Next lesson', value: 'Tax relief', note: '4 min read' } },
  { icon: 'trending_up', screen: 'investments', title: 'Investment recommendations', text: 'Fund allocations that suit each saver’s goals and risk.', card: { label: 'Fund allocation', value: 'Balanced', note: 'Reviewed today' } },
  { icon: 'autorenew', screen: 'reviews', title: 'Ongoing portfolio reviews', text: 'Regular and event-driven reviews that keep advice current.', card: { label: 'Next review', value: 'March', note: 'Triggered by pay rise' } },
];

export const deploymentOptions = [
  {
    icon: 'integration_instructions',
    title: 'Embedded',
    text: 'Embed myWaive’s recommendation engine inside your own digital user journey.',
    points: ['Applies your advice rules', 'You keep full control of the user experience', 'API-first, configuration-based set-up'],
  },
  {
    icon: 'devices',
    title: 'Stand-alone',
    text: 'A holistic financial advice platform, using myWaive’s user journey and engine.',
    points: ['SSO enabled', 'Option to white-label', 'Configured to your requirements'],
  },
];

export const trust = [
  { icon: 'cloud', title: 'Microsoft Azure, UK data residency', text: 'Primary residency in the UK with geo-redundant backups in a second UK region.' },
  { icon: 'lock', title: 'Enterprise security', text: 'Encrypted storage, TLS in transit, private networking, role-based access and threat intelligence.' },
  { icon: 'rule', title: 'Deterministic engine', text: 'Stateless and deterministic: the same inputs always produce the same outputs.' },
  { icon: 'fact_check', title: 'Tamper-evident audit trail', text: 'Every recommendation is logged and retained in line with COBS 9 record-keeping.' },
  { icon: 'shield', title: 'Isolated data', text: 'Your data sits in a dedicated, logically isolated environment - never co-mingled.' },
  { icon: 'policy', title: 'ISO 27001-aligned', text: 'An ISO 27001-aligned control programme, with certification to follow.' },
];

export const roadmap = {
  saving: {
    title: 'While you’re saving',
    items: ['Savings and investments in one place', 'Consolidate pension pots', 'Personalised financial planning tools', 'Investment recommendations that suit you', 'Continuous reviews as your life changes', 'Tailored financial education'],
  },
  retirement: {
    title: 'Into retirement',
    items: ['At-retirement planning', 'Tax-efficient drawdown guidance', 'Cashflow modelling', 'Ongoing portfolio monitoring', 'Add new savings products as required'],
  },
};

export const howItWorks = [
  { icon: 'link', title: 'Connect', text: 'Integrate via API or SSO. Your scheme data, rules and advice permissions become myWaive’s parameters.' },
  { icon: 'person_search', title: 'Understand', text: 'Members complete an engaging digital journey: goals, circumstances, risk and existing pots.' },
  { icon: 'verified', title: 'Advise', text: 'myWaive returns personalised, compliant advice on contributions, funds, transfers and retirement options.' },
  { icon: 'autorenew', title: 'Review', text: 'Regular and event-driven reviews keep advice current as life changes. Every step is fully audited, in line with regulation.' },
];

/** Provider onboarding — Pension providers and Product. */
export const onboarding = [
  { icon: 'forum', title: 'Scoping workshop', text: 'We map your scheme, rules, data and advice permissions.' },
  { icon: 'settings_suggest', title: 'Configured test environment', text: 'A fully configured environment with your data and rules - configuration, not development.' },
  { icon: 'science', title: 'Testing period', text: 'A 2-3 week testing period with onsite support from the myWaive team.' },
  { icon: 'rocket_launch', title: 'Go-live', text: 'Embedded in your journey or white-labelled under your brand.' },
];
