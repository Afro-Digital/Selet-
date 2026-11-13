export type Locale = 'en' | 'am';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  peopleAndRates: string;
  teamMembers: string;
  jobRoles: string;
  rateCards: string;
  costCatalog: string;
  currencyService: string;
  notifications: string;
  addMember: string;
  addRole: string;
  addRateCard: string;
  addItem: string;
  name: string;
  role: string;
  payType: string;
  currency: string;
  basicSalary: string;
  allowances: string;
  benefits: string;
  poessaPension: string;
  monthlyCost: string;
  utilization: string;
  productiveHours: string;
  hourlyCost: string;
  billingRate: string;
  nationalFlag: string;
  ethiopianNational: string;
  foreignNational: string;
  actions: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  active: string;
  inactive: string;
  defaultCard: string;
  setDefault: string;
  effectiveFrom: string;
  confidentialHidden: string;
  redactedNotice: string;
  monthlySalary: string;
  hourly: string;
  perProject: string;
  contractor: string;
  validationRequired: string;
  validationUtilization: string;
  validationPositive: string;
  roleOwner: string;
  rolePm: string;
  roleDeveloper: string;
  simulatedRole: string;
  // Stage 6 additions
  category: string;
  priceModel: string;
  payer: string;
  agencyPayer: string;
  clientPayer: string;
  staleAfterDays: string;
  verifiedAt: string;
  verifyNow: string;
  staleNotice: string;
  seedExamples: string;
  removeExamples: string;
  manualOverride: string;
  setOverride: string;
  clearOverride: string;
  refreshFeed: string;
  exchangeRateSnapshots: string;
  noNotifications: string;
  markAllRead: string;
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    appName: 'Selet (ስሌት)',
    tagline: 'Defensible cost estimation & pricing for Ethiopian software teams',
    peopleAndRates: 'People & Rate Cards',
    teamMembers: 'Team Members',
    jobRoles: 'Job Roles',
    rateCards: 'Rate Cards',
    costCatalog: 'Cost Catalog',
    currencyService: 'Currency & Exchange Rates',
    notifications: 'Notifications',
    addMember: 'Add Team Member',
    addRole: 'Add Job Role',
    addRateCard: 'Add Rate Card',
    addItem: 'Add Catalog Item',
    name: 'Full Name',
    role: 'Job Role',
    payType: 'Pay Type',
    currency: 'Currency',
    basicSalary: 'Basic Salary',
    allowances: 'Allowances',
    benefits: 'Benefits',
    poessaPension: 'Pension (POESSA 11%)',
    monthlyCost: 'Total Monthly Cost',
    utilization: 'Utilization',
    productiveHours: 'Productive Hrs/Mo',
    hourlyCost: 'Hourly Cost',
    billingRate: 'Billing Rate / hr',
    nationalFlag: 'Nationality',
    ethiopianNational: 'Ethiopian (11% Pension)',
    foreignNational: 'Non-Ethiopian (0% Pension)',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    active: 'Active',
    inactive: 'Inactive',
    defaultCard: 'Default Rate Card',
    setDefault: 'Set as Default',
    effectiveFrom: 'Effective Date',
    confidentialHidden: 'Confidential (Hidden)',
    redactedNotice:
      'Salary, overhead, and hourly costs are strictly redacted for non-owner accounts.',
    monthlySalary: 'Monthly Salary',
    hourly: 'Hourly Rate',
    perProject: 'Per Project',
    contractor: 'Contractor',
    validationRequired: 'This field is required',
    validationUtilization: 'Utilization must be between 1% and 100%',
    validationPositive: 'Amount must be greater than or equal to 0',
    roleOwner: 'Owner (Full Financials)',
    rolePm: 'Project Manager (Hours & Rates)',
    roleDeveloper: 'Developer (Costs Redacted)',
    simulatedRole: 'Simulate User Role',
    // Stage 6
    category: 'Category',
    priceModel: 'Pricing Model',
    payer: 'Payer Responsibility',
    agencyPayer: 'Agency Internal (Overhead)',
    clientPayer: 'Client Direct (Pass-Through)',
    staleAfterDays: 'Stale After (Days)',
    verifiedAt: 'Last Verified',
    verifyNow: 'Verify Price',
    staleNotice: 'Price verification overdue',
    seedExamples: 'Seed Starter Examples',
    removeExamples: 'Remove Example Items',
    manualOverride: 'Manual Rate Override',
    setOverride: 'Apply Override',
    clearOverride: 'Clear Override',
    refreshFeed: 'Refresh NBE Feed',
    exchangeRateSnapshots: 'Exchange Rate Snapshots',
    noNotifications: 'No unread notifications.',
    markAllRead: 'Mark All Read',
  },
  am: {
    appName: 'ስሌት (Selet)',
    tagline: 'ለኢትዮጵያ ሶፍትዌር አበልጻጊዎች አስተማማኝ የወጪ እና የዋጋ ማስያ ስሌት',
    peopleAndRates: 'የቡድን አባላት እና የዋጋ ዝርዝር',
    teamMembers: 'የቡድን አባላት',
    jobRoles: 'የሥራ መደቦች',
    rateCards: 'የክፍያ ተመን ካርዶች',
    costCatalog: 'የወጪ ካታሎግ (እቃዎችና አገልግሎቶች)',
    currencyService: 'የምንዛሬ ተመን እና ልውውጥ',
    notifications: 'ማሳወቂያዎች',
    addMember: 'አዲስ አባል ጨምር',
    addRole: 'አዲስ መደብ ጨምር',
    addRateCard: 'አዲስ ተመን ካርድ ጨምር',
    addItem: 'አዲስ የወጪ እቃ ጨምር',
    name: 'ሙሉ ስም',
    role: 'የሥራ መደብ',
    payType: 'የክፍያ ዓይነት',
    currency: 'የገንዘብ ዓይነት',
    basicSalary: 'መሰረታዊ ደመወዝ',
    allowances: 'አበል',
    benefits: 'ጥቅማጥቅም',
    poessaPension: 'የጡረታ መዋጮ (ፖኤሳ 11%)',
    monthlyCost: 'አጠቃላይ ወርሃዊ ወጪ',
    utilization: 'የሥራ አጠቃቀም መጠን',
    productiveHours: 'ውጤታማ ሰዓታት በወር',
    hourlyCost: 'የሰዓት ወጪ',
    billingRate: 'የደንበኛ ክፍያ ተመን በሰዓት',
    nationalFlag: 'ዜግነት',
    ethiopianNational: 'ኢትዮጵያዊ (11% ጡረታ)',
    foreignNational: 'የውጭ ዜጋ (0% ጡረታ)',
    actions: 'ተግባራት',
    edit: 'አስተካክል',
    delete: 'ሰርዝ',
    save: 'አስቀምጥ',
    cancel: 'ይቅር',
    active: 'ንቁ',
    inactive: 'የቦዘነ',
    defaultCard: 'ዋና የክፍያ ተመን',
    setDefault: 'ዋና ተመን አድርግ',
    effectiveFrom: 'የሚተገበርበት ቀን',
    confidentialHidden: 'ሚስጥራዊ (የተደበቀ)',
    redactedNotice: 'የደመወዝ እና የወጪ መረጃዎች ለባለቤት ብቻ የሚታዩ ናቸው።',
    monthlySalary: 'ወርሃዊ ደመወዝ',
    hourly: 'የሰዓት ሂሳብ',
    perProject: 'በፕሮጀክት',
    contractor: 'ኮንትራክተር',
    validationRequired: 'ይህ መረጃ አስፈላጊ ነው',
    validationUtilization: 'የሥራ አጠቃቀም መጠን ከ 1% እስከ 100% መሆን አለበት',
    validationPositive: 'መጠኑ ከ 0 በላይ ወይም እኩል መሆን አለበት',
    roleOwner: 'ባለቤት (ሙሉ ፋይናንስ)',
    rolePm: 'የፕሮጀክት መሪ (ሰዓታት እና ተመኖች)',
    roleDeveloper: 'አበልጻጊ (ወጪዎች የተደበቁ)',
    simulatedRole: 'የተጠቃሚ ሚና አስመስል',
    // Stage 6
    category: 'ምድብ',
    priceModel: 'የዋጋ አከፋፈል ሞዴል',
    payer: 'ከፋይ',
    agencyPayer: 'ኤጀንሲ (የቤት ውስጥ ወጪ)',
    clientPayer: 'ደንበኛ (ቀጥተኛ ወጪ)',
    staleAfterDays: 'የሚያረጅበት ጊዜ (ቀናት)',
    verifiedAt: 'የተረጋገጠበት ቀን',
    verifyNow: 'ዋጋውን አረጋግጥ',
    staleNotice: 'የዋጋ ማረጋገጫ ጊዜው አልፏል',
    seedExamples: 'የናሙና እቃዎችን ጫን',
    removeExamples: 'የናሙና እቃዎችን አስወግድ',
    manualOverride: 'የእጅ ምንዛሬ ተመን መተኪያ',
    setOverride: 'ተመኑን ተግብር',
    clearOverride: 'ተመኑን መልስ',
    refreshFeed: 'ከብሔራዊ ባንክ አድስ',
    exchangeRateSnapshots: 'የምንዛሬ ታሪክ ቅጽበቶች',
    noNotifications: 'ምንም ያልተነበበ ማሳወቂያ የለም።',
    markAllRead: 'ሁሉንም እንደተነበበ ምልክት አድርግ',
  },
};
