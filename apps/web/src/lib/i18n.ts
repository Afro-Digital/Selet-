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
  // Stage 7 additions
  estimates: string;
  estimateBuilder: string;
  wbsHierarchy: string;
  modules: string;
  addModule: string;
  moduleName: string;
  addSubmodule: string;
  features: string;
  addFeature: string;
  featureName: string;
  estimationMethod: string;
  threePoint: string;
  singleValue: string;
  tshirtSize: string;
  storyPoints: string;
  optimisticO: string;
  likelyL: string;
  pessimisticP: string;
  singleHours: string;
  points: string;
  expectedHours: string;
  assignedDeveloper: string;
  unassigned: string;
  onlyAssignedCanEdit: string;
  developerHoursOnlyNotice: string;
  starterTemplates: string;
  loadTemplate: string;
  seedTemplates: string;
  deleteTemplate: string;
  exampleHoursDisclaimer: string;
  totalEstimateHours: string;
  roleBreakdown: string;
  estimatedLaborCost: string;
  createProject: string;
  projectName: string;
  projectDescription: string;
  selectProject: string;
  // Stage 8 additions
  scaleEstimator: string;
  scaleAndRisk: string;
  monthlyUsers: string;
  peakConcurrency: string;
  storageGb: string;
  trafficGb: string;
  paymentVolume: string;
  calculateSuggestions: string;
  suggestedInfrastructure: string;
  assumptions: string;
  contingencyRate: string;
  overheadRate: string;
  riskFactors: string;
  totalRiskRate: string;
  clientMonthlyRecurring: string;
  agencyMonthlyRecurring: string;
  totalMonthlyRecurring: string;
  costBreakdown: string;
  directCost: string;
  riskContingencyCost: string;
  overheadCost: string;
  totalProjectCost: string;
  unclearRequirements: string;
  frequentChanges: string;
  newTechnology: string;
  tightDeadline: string;
  overrideItem: string;
  // Stage 9: Pricing scenarios and Margin Balancer
  pricingAndMargins: string;
  marginBalancer: string;
  targetMargin: string;
  minimumMargin: string;
  stretchMargin: string;
  marketRange: string;
  lowScenario: string;
  recommendedScenario: string;
  highScenario: string;
  lockBlendedMargin: string;
  targetPriceMode: string;
  whatIfDiscount: string;
  ownerFloorViolated: string;
  ownerApprovalRequired: string;
  approveBelowFloor: string;
  ownerApprovedNotice: string;
  infeasibleMarginGap: string;
  blendedMargin: string;
  projectCostBasis: string;
  recommendedPrice: string;
  projectProfit: string;
  balancingExplanation: string;
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
    // Stage 7
    estimates: 'Estimates',
    estimateBuilder: 'Estimate Builder',
    wbsHierarchy: 'Work Breakdown Structure (WBS)',
    modules: 'Modules & Epics',
    addModule: 'Add Module',
    moduleName: 'Module Name',
    addSubmodule: 'Add Submodule',
    features: 'Features & Tasks',
    addFeature: 'Add Feature',
    featureName: 'Feature Name',
    estimationMethod: 'Estimation Method',
    threePoint: 'PERT Three-Point (O/L/P)',
    singleValue: 'Single Value (Hours)',
    tshirtSize: 'T-Shirt Sizing (XS-XL)',
    storyPoints: 'Story Points (1pt = 8h)',
    optimisticO: 'Optimistic (O)',
    likelyL: 'Likely (L)',
    pessimisticP: 'Pessimistic (P)',
    singleHours: 'Hours',
    points: 'Points',
    expectedHours: 'Expected Hours',
    assignedDeveloper: 'Assigned Developer',
    unassigned: 'Unassigned',
    onlyAssignedCanEdit: 'Developers can only enter hours for tasks assigned to them.',
    developerHoursOnlyNotice: 'Financial costs and rate cards are hidden in Developer mode.',
    starterTemplates: 'Starter Templates',
    loadTemplate: 'Load Starter Template',
    seedTemplates: 'Seed Starter Templates',
    deleteTemplate: 'Delete Template',
    exampleHoursDisclaimer: 'Example hours provided for reference. Adjust to your project scope.',
    totalEstimateHours: 'Total Project Hours',
    roleBreakdown: 'Hours by Role',
    estimatedLaborCost: 'Estimated Labor Cost',
    createProject: 'New Project',
    projectName: 'Project Name',
    projectDescription: 'Project Description',
    selectProject: 'Select Project',
    // Stage 8
    scaleEstimator: 'Scale Estimator',
    scaleAndRisk: 'Risk & Scale Estimator',
    monthlyUsers: 'Monthly Active Users (MAU)',
    peakConcurrency: 'Peak Concurrency',
    storageGb: 'Storage (GB)',
    trafficGb: 'Bandwidth (GB/mo)',
    paymentVolume: 'Monthly Payment Volume (ETB)',
    calculateSuggestions: 'Suggest Infrastructure & Recurring Costs',
    suggestedInfrastructure: 'Suggested Recurring Infrastructure & Services',
    assumptions: 'Assumptions & Sizing Rationale',
    contingencyRate: 'Contingency Rate (%)',
    overheadRate: 'Overhead Rate (%)',
    riskFactors: 'Risk Multipliers & Uncertainty Factors',
    totalRiskRate: 'Total Risk Multiplier',
    clientMonthlyRecurring: 'Client Pass-Through Recurring',
    agencyMonthlyRecurring: 'Agency Internal Recurring',
    totalMonthlyRecurring: 'Total Recurring Monthly Cost',
    costBreakdown: 'Full Project Cost Breakdown',
    directCost: 'Direct Project Cost',
    riskContingencyCost: 'Risk & Contingency Allowance',
    overheadCost: 'Overhead Allocation',
    totalProjectCost: 'Total Project Cost (Direct + Risk + Overhead)',
    unclearRequirements: 'Unclear or Evolving Requirements',
    frequentChanges: 'Frequent Scope Changes Expected',
    newTechnology: 'New / Unfamiliar Technology Stack',
    tightDeadline: 'Tight Deadline / Urgent Delivery',
    overrideItem: 'Override Sizing / Cost',
    // Stage 9
    pricingAndMargins: 'Pricing & Margin Balancer',
    marginBalancer: 'Margin Balancer',
    targetMargin: 'Target Margin (%)',
    minimumMargin: 'Minimum Margin Floor (%)',
    stretchMargin: 'Stretch Margin (%)',
    marketRange: 'Market Price Range',
    lowScenario: 'Conservative / Low',
    recommendedScenario: 'Recommended',
    highScenario: 'Stretch / High',
    lockBlendedMargin: 'Lock Blended Margin',
    targetPriceMode: 'Target Price (Client Budget)',
    whatIfDiscount: 'What-If Discount',
    ownerFloorViolated: 'Below Owner Margin Floor',
    ownerApprovalRequired: 'Owner Approval Required',
    approveBelowFloor: 'Approve Below-Floor Pricing',
    ownerApprovedNotice: 'Owner Override Approved',
    infeasibleMarginGap: 'Infeasible: Margin Guardrail Violation',
    blendedMargin: 'Blended Margin',
    projectCostBasis: 'Project Cost Basis',
    recommendedPrice: 'Recommended Price',
    projectProfit: 'Projected Net Profit',
    balancingExplanation:
      'Balancing lines adjusted automatically to preserve blended target margin.',
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
    // Stage 7
    estimates: 'ስሌቶች',
    estimateBuilder: 'የግምት እና የሰዓት ማስያ',
    wbsHierarchy: 'የሥራ ክፍፍል መዋቅር (WBS)',
    modules: 'ሞጁሎች እና ዋና ክፍሎች',
    addModule: 'አዲስ ሞጁል ጨምር',
    moduleName: 'የሞጁል ስም',
    addSubmodule: 'ንዑስ ሞጁል ጨምር',
    features: 'ተግባራት እና ዝርዝሮች',
    addFeature: 'አዲስ ተግባር ጨምር',
    featureName: 'የተግባሩ ስም',
    estimationMethod: 'የግምት ስልት',
    threePoint: 'ባለሶስት-ነጥብ ግምት PERT (O/L/P)',
    singleValue: 'ቀጥተኛ የሰዓት መጠን',
    tshirtSize: 'የቲሸርት ልኬት (XS-XL)',
    storyPoints: 'የታሪክ ነጥቦች (1pt = 8h)',
    optimisticO: 'ምርጥ ግምት (O)',
    likelyL: 'እውነተኛ ግምት (L)',
    pessimisticP: 'አስቸጋሪ ግምት (P)',
    singleHours: 'ሰዓታት',
    points: 'ነጥቦች',
    expectedHours: 'የሚጠበቅ የሰዓት ድምር',
    assignedDeveloper: 'የተመደበለት አበልጻጊ',
    unassigned: 'ያልተመደበ',
    onlyAssignedCanEdit: 'አበልጻጊዎች ለእነሱ የተመደቡትን ተግባራት ብቻ መቀየር ይችላሉ።',
    developerHoursOnlyNotice: 'የፋይናንስ ወጪዎች እና ተመኖች በአበልጻጊ እይታ ውስጥ ተደብቀዋል።',
    starterTemplates: 'የመነሻ ቴምፕሌቶች',
    loadTemplate: 'ቴምፕሌት ጫን',
    seedTemplates: 'መደበኛ ቴምፕሌቶችን ጫን',
    deleteTemplate: 'ቴምፕሌት ሰርዝ',
    exampleHoursDisclaimer: 'የተሰጡት ሰዓታት ለማሳያነት ብቻ ናቸው። እንደ ፕሮጀክትዎ መጠን ያስተካክሉ።',
    totalEstimateHours: 'አጠቃላይ የፕሮጀክት ሰዓታት',
    roleBreakdown: 'ሰዓታት በሥራ መደብ',
    estimatedLaborCost: 'የሰው ኃይል ወጪ ግምት',
    createProject: 'አዲስ ፕሮጀክት',
    projectName: 'የፕሮጀክት ስም',
    projectDescription: 'የፕሮጀክት መግለጫ',
    selectProject: 'ፕሮጀክት ይምረጡ',
    // Stage 8
    scaleEstimator: 'የስኬል እና የተጠቃሚዎች መጠን ግምት',
    scaleAndRisk: 'አደጋ፣ ተጓዳኝ ወጪ እና ስኬል ማስያ',
    monthlyUsers: 'ወርሃዊ ንቁ ተጠቃሚዎች (MAU)',
    peakConcurrency: 'ከፍተኛ የአንድ ጊዜ ተጠቃሚዎች',
    storageGb: 'የማከማቻ መጠን (GB)',
    trafficGb: 'ወርሃዊ የዳታ ዝውውር (GB)',
    paymentVolume: 'ወርሃዊ የክፍያ መጠን (በብር)',
    calculateSuggestions: 'ተስማሚ መሠረተ-ልማት እና ተደጋጋሚ ወጪዎችን አስላ',
    suggestedInfrastructure: 'የተጠቆሙ ተደጋጋሚ የመሠረተ-ልማት አገልግሎቶች',
    assumptions: 'የግምት መነሻዎች እና ማብራሪያ',
    contingencyRate: 'ያልተጠበቁ ክስተቶች መጠባበቂያ (%)',
    overheadRate: 'አጠቃላይ የድርጅት አስተዳደራዊ ወጪ (%)',
    riskFactors: 'የአደጋ እና ውስብስብነት ማባዣዎች',
    totalRiskRate: 'አጠቃላይ የአደጋ ማባዣ ድምር',
    clientMonthlyRecurring: 'የደንበኛ ቀጥተኛ ወርሃዊ ወጪ',
    agencyMonthlyRecurring: 'የኤጀንሲ የውስጥ ወርሃዊ ወጪ',
    totalMonthlyRecurring: 'አጠቃላይ ወርሃዊ ተደጋጋሚ ወጪ',
    costBreakdown: 'ሙሉ የፕሮጀክት ወጪ ዝርዝር',
    directCost: 'ቀጥተኛ የፕሮጀክት ወጪ',
    riskContingencyCost: 'የአደጋ እና የመጠባበቂያ ወጪ',
    overheadCost: 'የአስተዳደራዊ ወጪ ድርሻ',
    totalProjectCost: 'አጠቃላይ የፕሮጀክቱ ወጪ (ቀጥተኛ + አደጋ + አስተዳደራዊ)',
    unclearRequirements: 'ግልጽ ያልሆኑ ወይም ተለዋዋጭ ፍላጎቶች',
    frequentChanges: 'ተደጋጋሚ የሥራ ወሰን ለውጦች',
    newTechnology: 'አዲስ ወይም ያልተለመደ የቴክኖሎጂ ቁልል',
    tightDeadline: 'አስቸኳይ ወይም አጭር የማስረከቢያ ጊዜ',
    overrideItem: 'የእቃውን መጠን/ዋጋ ቀይር',
    // Stage 9
    pricingAndMargins: 'የዋጋ እና የትርፍ ህዳግ ማመጣጠኛ',
    marginBalancer: 'የትርፍ ማመጣጠኛ (Margin Balancer)',
    targetMargin: 'ዒላማ የትርፍ ህዳግ (%)',
    minimumMargin: 'ዝቅተኛ የትርፍ ወለል (%)',
    stretchMargin: 'ከፍተኛ የትርፍ ጣሪያ (%)',
    marketRange: 'የገበያ ዋጋ ክልል',
    lowScenario: 'ዝቅተኛ አማራጭ',
    recommendedScenario: 'የሚመከር ዋጋ',
    highScenario: 'ከፍተኛ አማራጭ',
    lockBlendedMargin: 'አማካይ የትርፍ ህዳግን ቆልፍ',
    targetPriceMode: 'የደንበኛ በጀት (የተወሰነ ዋጋ)',
    whatIfDiscount: 'የቅናሽ አማራጭ (ምን ቢሆን?)',
    ownerFloorViolated: 'ከድርጅቱ ዝቅተኛ የትርፍ ወለል በታች ነው',
    ownerApprovalRequired: 'የባለቤት ፈቃድ ያስፈልጋል',
    approveBelowFloor: 'ከወለል በታች ዋጋን አጽድቅ',
    ownerApprovedNotice: 'የባለቤት ማጽደቂያ ተሰጥቷል',
    infeasibleMarginGap: 'ሊተገበር የማይችል የትርፍ ክፍተት',
    blendedMargin: 'አማካይ የትርፍ ህዳግ',
    projectCostBasis: 'የፕሮጀክት መነሻ ወጪ',
    recommendedPrice: 'የሚመከር የመሸጫ ዋጋ',
    projectProfit: 'የሚጠበቅ የተጣራ ትርፍ',
    balancingExplanation: 'ዒላማ አማካይ የትርፍ ህዳግን ለመጠበቅ ሌሎች መስመሮች በራስ-ሰር ተስተካክለዋል።',
  },
};
