 
import Decimal from "decimal.js";
import { SalaryForm } from '../schemas/salarySchema';

// ── Tax Slab Types ────────────────────────────────────────────────────
interface TaxSlab {
  min: number;
  max: number;
  rate: number;   // marginal rate (0–1)
  fixed: number;  // base tax already computed on income below min
}

export interface CountryTaxConfig {
  name: string;
  currency: string;
  currencySymbol: string;
  slabs?: TaxSlab[];
  notes: string;
  socialSecurity?: number;  // flat % on top (e.g. FICA, NI, PF)
  socialSecurityLabel?: string;
  socialSecurityWageBase?: number;
  medicareRate?: number;
  additionalMedicareThreshold?: number;
  taxCalculator?: (taxableIncome: number) => { tax: number; marginalRate: number };
  contributionCalculator?: (grossIncome: number) => number;
}

// ── Country Tax Databases ─────────────────────────────────────────────
export const COUNTRY_TAX_CONFIGS: Record<string, CountryTaxConfig> = {

  // ── Pakistan (salary income, Tax Year 2026-27) ──────────────────────
  pk: {
    name: 'Pakistan', currency: 'PKR', currencySymbol: '₨',
    notes: 'FBR salary tax rates, Tax Year 2026-27. No social security contribution modelled. Exemptions and tax credits are not included.',
    slabs: [
      { min: 0,        max: 600_000,   rate: 0,    fixed: 0 },
      { min: 600_000,  max: 1_200_000, rate: 0.01, fixed: 0 },
      { min: 1_200_000,max: 2_200_000, rate: 0.11, fixed: 6_000 },
      { min: 2_200_000,max: 3_200_000, rate: 0.20, fixed: 116_000 },
      { min: 3_200_000,max: 4_100_000, rate: 0.25, fixed: 316_000 },
      { min: 4_100_000,max: Infinity,  rate: 0.29, fixed: 541_000 },
    ],
  },

  // ── India (New Tax Regime FY 2026-27) ─────────────────────────────
  in: {
    name: 'India', currency: 'INR', currencySymbol: '₹',
    notes: 'New Tax Regime (FY 2026-27). Standard deduction of ₹75,000 and section 87A rebate applied. PF @ 12% of estimated basic salary (50% of CTC).',
    socialSecurityLabel: 'Estimated PF (12% of basic)',
    contributionCalculator: gross => gross * .5 * .12,
    slabs: [
      { min: 0,          max: 400_000,    rate: 0,    fixed: 0 },
      { min: 400_000,    max: 800_000,    rate: 0.05, fixed: 0 },
      { min: 800_000,    max: 1_200_000,  rate: 0.10, fixed: 20_000 },
      { min: 1_200_000,  max: 1_600_000,  rate: 0.15, fixed: 60_000 },
      { min: 1_600_000,  max: 2_000_000,  rate: 0.20, fixed: 120_000 },
      { min: 2_000_000,  max: 2_400_000,  rate: 0.25, fixed: 200_000 },
      { min: 2_400_000,  max: Infinity,   rate: 0.30, fixed: 300_000 },
    ],
  },

  // ── USA (Federal, Single filer 2026) ──────────────────────────────
  us: {
    name: 'USA', currency: 'USD', currencySymbol: '$',
    notes: 'Federal income tax (single filer 2026) less the $16,100 standard deduction. FICA uses the $184,500 Social Security wage base plus uncapped Medicare. State taxes are not included.',
    socialSecurity: 0.062, socialSecurityWageBase: 184_500, medicareRate: 0.0145, additionalMedicareThreshold: 200_000, socialSecurityLabel: 'FICA (Social Security + Medicare)',
    slabs: [
      { min: 0,        max: 12_400,   rate: 0.10, fixed: 0 },
      { min: 12_400,   max: 50_400,   rate: 0.12, fixed: 1_240 },
      { min: 50_400,   max: 105_700,  rate: 0.22, fixed: 5_800 },
      { min: 105_700,  max: 201_775,  rate: 0.24, fixed: 17_966 },
      { min: 201_775,  max: 256_225,  rate: 0.32, fixed: 41_024 },
      { min: 256_225,  max: 640_600,  rate: 0.35, fixed: 58_448 },
      { min: 640_600,  max: Infinity, rate: 0.37, fixed: 192_979.25 },
    ],
  },

  // ── United Kingdom (England, Wales and Northern Ireland, 2026-27) ─
  uk: {
    name: 'United Kingdom', currency: 'GBP', currencySymbol: '£',
    notes: 'UK 2026-27 estimate for England, Wales and Northern Ireland; Scotland uses different income tax bands. Includes employee Class 1 NI. Personal allowance taper is modelled; tax codes and other reliefs are not.',
    socialSecurityLabel: 'National Insurance (Class 1)',
    taxCalculator: (income) => {
      const allowance = Math.max(0, 12_570 - Math.max(0, income - 100_000) / 2);
      const taxable = Math.max(0, income - allowance);
      const bands = [{ min: 0, max: 37_700, rate: .20, fixed: 0 }, { min: 37_700, max: 125_140, rate: .40, fixed: 7_540 }, { min: 125_140, max: Infinity, rate: .45, fixed: 42_516 }];
      const current = bands.find(b => taxable < b.max) ?? bands[bands.length - 1];
      return { tax: current.fixed + Math.max(0, taxable - current.min) * current.rate, marginalRate: current.rate * (income > 100_000 && income < 125_140 ? 1.5 : 1) };
    },
    contributionCalculator: gross => Math.max(0, Math.min(gross, 50_270) - 12_570) * .08 + Math.max(0, gross - 50_270) * .02,
  },

  // ── Canada (Federal 2026, outside Quebec) ─────────────────────────
  ca: {
    name: 'Canada', currency: 'CAD', currencySymbol: 'C$',
    notes: 'Canada federal tax 2026 outside Quebec; provincial/territorial income tax is excluded. Includes estimated federal basic personal amount credit, CPP and EI. Credits and province-specific payroll rules vary.',
    socialSecurityLabel: 'CPP + EI',
    taxCalculator: (income) => {
      const bands = [{ min: 0, max: 58_523, rate: .14, fixed: 0 }, { min: 58_523, max: 117_045, rate: .205, fixed: 8_193.22 }, { min: 117_045, max: 181_440, rate: .26, fixed: 20_190.23 }, { min: 181_440, max: 258_482, rate: .29, fixed: 36_932.93 }, { min: 258_482, max: Infinity, rate: .33, fixed: 59_275.11 }];
      const current = bands.find(b => income < b.max) ?? bands[bands.length - 1];
      const grossTax = current.fixed + Math.max(0, income - current.min) * current.rate;
      const bpa = income <= 181_440 ? 16_452 : Math.max(14_829, 16_452 - (income - 181_440) * (16_452 - 14_829) / (258_482 - 181_440));
      return { tax: Math.max(0, grossTax - bpa * .14), marginalRate: current.rate };
    },
    contributionCalculator: gross => Math.max(0, Math.min(gross, 74_600) - 3_500) * .0595 + Math.max(0, Math.min(gross, 85_000) - 74_600) * .04 + Math.min(gross, 68_900) * .0163,
  },

  // ── Australia (resident, FY 2026-27) ───────────────────────────────
  au: {
    name: 'Australia', currency: 'AUD', currencySymbol: 'A$',
    notes: 'Australian resident income tax 2026-27, plus an estimated 2% Medicare levy. Does not model low-income levy exemptions, offsets, HELP repayments, or non-resident rates.',
    socialSecurity: 0.02, socialSecurityLabel: 'Medicare Levy (2%)',
    slabs: [
      { min: 0,        max: 18_200,   rate: 0,    fixed: 0 },
      { min: 18_200,   max: 45_000,   rate: 0.15, fixed: 0 },
      { min: 45_000,   max: 135_000, rate: 0.30, fixed: 4_020 },
      { min: 135_000,  max: 190_000, rate: 0.37, fixed: 31_020 },
      { min: 190_000,  max: Infinity, rate: 0.45, fixed: 51_370 },
    ],
  },

  // ── Germany (single filer, 2026 tariff estimate) ───────────────────
  de: {
    name: 'Germany', currency: 'EUR', currencySymbol: '€',
    notes: 'German 2026 §32a income tax tariff for a single taxpayer, excluding church tax, solidarity surcharge, allowances, and splitting. Social contributions are a rough 20.5% estimate; contribution ceilings and insurance status are not modelled.',
    socialSecurity: 0.205, socialSecurityLabel: 'Social Contributions (~20.5%)',
    taxCalculator: income => {
      const x = Math.floor(income);
      if (x <= 12_348) return { tax: 0, marginalRate: 0 };
      if (x <= 17_799) { const y = (x - 12_348) / 10_000; return { tax: Math.floor((914.51 * y + 1_400) * y), marginalRate: (1_829.02 * y + 1_400) / 10_000 }; }
      if (x <= 69_878) { const z = (x - 17_799) / 10_000; return { tax: Math.floor((173.10 * z + 2_397) * z + 1_034.87), marginalRate: (346.2 * z + 2_397) / 10_000 }; }
      if (x <= 277_825) return { tax: Math.floor(.42 * x - 11_135.63), marginalRate: .42 };
      return { tax: Math.floor(.45 * x - 19_470.38), marginalRate: .45 };
    },
  },

  // ── UAE (0% tax) ──────────────────────────────────────────────────
  ae: {
    name: 'UAE', currency: 'AED', currencySymbol: 'AED',
    notes: 'No personal income tax in UAE. Expatriates have no social security obligation. Nationals contribute 5% GPSSA.',
    slabs: [{ min: 0, max: Infinity, rate: 0, fixed: 0 }],
  },

  // ── Saudi Arabia ──────────────────────────────────────────────────
  sa: {
    name: 'Saudi Arabia', currency: 'SAR', currencySymbol: 'SAR',
    notes: 'No personal income tax for residents/expats on employment income. GOSI social insurance for Saudis only (10% employee share).',
    slabs: [{ min: 0, max: Infinity, rate: 0, fixed: 0 }],
  },

  // ── Singapore ────────────────────────────────────────────────────
  sg: {
    name: 'Singapore', currency: 'SGD', currencySymbol: 'S$',
    notes: 'Singapore resident income tax rates from YA 2024 (also applied for YA 2026). Assumes a Singapore Citizen/third-year-or-later PR aged 55 or below for employee CPF, capped at the 2026 ordinary-wage ceiling of S$8,000/month; age, residency status, bonuses and CPF reliefs are not modelled.',
    socialSecurityLabel: 'Estimated CPF employee share',
    contributionCalculator: gross => Math.min(gross, 96_000) * .20,
    slabs: [
      { min: 0,        max: 20_000,   rate: 0,    fixed: 0 },
      { min: 20_000,   max: 30_000,   rate: 0.02, fixed: 0 },
      { min: 30_000,   max: 40_000,   rate: 0.035,fixed: 200 },
      { min: 40_000,   max: 80_000,   rate: 0.07, fixed: 550 },
      { min: 80_000,   max: 120_000,  rate: 0.115,fixed: 3_350 },
      { min: 120_000,  max: 160_000,  rate: 0.15, fixed: 7_950 },
      { min: 160_000,  max: 200_000,  rate: 0.18, fixed: 13_950 },
      { min: 200_000,  max: 240_000,  rate: 0.19, fixed: 21_150 },
      { min: 240_000,  max: 280_000,  rate: 0.195,fixed: 28_750 },
      { min: 280_000,  max: 320_000,  rate: 0.20, fixed: 36_550 },
      { min: 320_000,  max: 500_000,  rate: 0.22, fixed: 44_550 },
      { min: 500_000,  max: 1_000_000,rate: 0.23, fixed: 84_150 },
      { min: 1_000_000,max: Infinity, rate: 0.24, fixed: 199_150 },
    ],
  },

  // ── Bangladesh ────────────────────────────────────────────────────
  bd: {
    name: 'Bangladesh', currency: 'BDT', currencySymbol: '৳',
    notes: 'Bangladesh individual income tax for assessment years 2026-27 and 2027-28. Applies the standard resident threshold and BDT 5,000 minimum tax; special thresholds, surcharges and rebates are not modelled.',
    slabs: [
      { min: 0,          max: 375_000,    rate: 0,    fixed: 0 },
      { min: 375_000,    max: 675_000,    rate: 0.10, fixed: 0 },
      { min: 675_000,    max: 1_075_000,  rate: 0.15, fixed: 30_000 },
      { min: 1_075_000,  max: 1_575_000,  rate: 0.20, fixed: 90_000 },
      { min: 1_575_000,  max: 3_575_000,  rate: 0.25, fixed: 190_000 },
      { min: 3_575_000,  max: Infinity,   rate: 0.30, fixed: 690_000 },
    ],
  },

  // ── Custom (manual override) ──────────────────────────────────────
  custom: {
    name: 'Custom / Other',
    currency: 'USD', currencySymbol: '$',
    notes: 'Enter your own flat effective tax rate below.',
    slabs: [],
  },
};

// ── Engine ────────────────────────────────────────────────────────────
export interface TaxBreakdownSlab {
  label: string;
  taxable: number;
  rate: number;
  tax: number;
}

export interface SalaryPeriod {
  gross: number;
  tax: number;
  socialSecurity: number;
  deductions: number;
  net: number;
}

export interface SalaryResult {
  annual:         SalaryPeriod;
  monthly:        SalaryPeriod;
  biweekly:       SalaryPeriod;
  weekly:         SalaryPeriod;
  effectiveTaxRate: number;
  marginalRate:    number;
  slabBreakdown:   TaxBreakdownSlab[];
  countryConfig:   CountryTaxConfig;
  currencySymbol:  string;
}

function computeSlabTax(annual: number, slabs: TaxSlab[]): { tax: number; marginalRate: number; breakdown: TaxBreakdownSlab[] } {
  if (!slabs.length) return { tax: 0, marginalRate: 0, breakdown: [] };

  const slab = slabs.find(s => annual >= s.min && annual < s.max) ?? slabs[slabs.length - 1];
  const tax  = slab.fixed + Math.max(0, annual - slab.min) * slab.rate;

  const breakdown: TaxBreakdownSlab[] = slabs
    .filter(s => s.rate > 0 && annual > s.min)
    .map(s => {
      const taxable = Math.min(annual, s.max) - s.min;
      return {
        label:   `${(s.rate * 100).toFixed(0)}% on ${s.min === 0 ? 'first' : 'income'} up to ${s.max === Infinity ? '∞' : s.max.toLocaleString()}`,
        taxable: Math.max(0, taxable),
        rate:    s.rate,
        tax:     Math.max(0, taxable) * s.rate,
      };
    });

  return { tax, marginalRate: slab.rate, breakdown };
}

export function calculateSalary(params: SalaryForm): SalaryResult {
  // Annualise gross
  let annualGross = new Decimal(params.grossSalary || 0);
  if (params.payFrequency === 'monthly')  annualGross = annualGross.times(12);
  if (params.payFrequency === 'biweekly') annualGross = annualGross.times(26);
  if (params.payFrequency === 'weekly')   annualGross = annualGross.times(52);

  const gross = annualGross.toNumber();
  const config = COUNTRY_TAX_CONFIGS[params.country ?? 'us'] ?? COUNTRY_TAX_CONFIGS['us'];

  // Compute income tax via slabs (or custom flat rate)
  let incomeTax = 0;
  let marginalRate = 0;
  let slabBreakdown: TaxBreakdownSlab[] = [];

  if (params.country === 'custom') {
    const flatRate = (params.customTaxRate ?? 20) / 100;
    incomeTax    = gross * flatRate;
    marginalRate = flatRate;
    slabBreakdown = [{ label: `Flat ${params.customTaxRate ?? 20}% tax`, taxable: gross, rate: flatRate, tax: incomeTax }];
  } else {
    // India: apply standard deduction ₹75,000 first
    const taxableIncome = params.country === 'in' ? Math.max(0, gross - 75_000) : params.country === 'us' ? Math.max(0, gross - 16_100) : gross;
    const result: { tax: number; marginalRate: number; breakdown?: TaxBreakdownSlab[] } = config.taxCalculator
      ? config.taxCalculator(taxableIncome)
      : computeSlabTax(taxableIncome, config.slabs ?? []);
    incomeTax    = result.tax;
    if (params.country === 'bd' && gross > 375_000) incomeTax = Math.max(incomeTax, 5_000);
    if (params.country === 'in') {
      if (taxableIncome <= 1_200_000) incomeTax = Math.max(0, incomeTax - 60_000);
      else incomeTax = Math.min(incomeTax, taxableIncome - 1_200_000); // marginal relief at rebate limit
    }
    marginalRate = result.marginalRate;
    slabBreakdown = result.breakdown
      ? result.breakdown
      : [{ label: 'Estimated tax after allowances and credits', taxable: taxableIncome, rate: result.marginalRate, tax: incomeTax }];
  }

  // Social security / contributions
  const ssRate = config.socialSecurity ?? 0;
  const ssBase = config.socialSecurityWageBase ? Math.min(gross, config.socialSecurityWageBase) : gross;
  let ssTax = config.contributionCalculator ? config.contributionCalculator(gross) : ssBase * ssRate;
  if (config.medicareRate) {
    ssTax += gross * config.medicareRate;
    if (config.additionalMedicareThreshold && gross > config.additionalMedicareThreshold) {
      ssTax += (gross - config.additionalMedicareThreshold) * 0.009;
    }
  }

  const totalTax = incomeTax + ssTax;
  const effectiveTaxRate = gross > 0 ? ((totalTax / gross) * 100) : 0;

  // Annualise deductions
  let annualDeductions = new Decimal(params.deductions || 0);
  if (params.payFrequency === 'monthly')  annualDeductions = annualDeductions.times(12);
  if (params.payFrequency === 'biweekly') annualDeductions = annualDeductions.times(26);
  if (params.payFrequency === 'weekly')   annualDeductions = annualDeductions.times(52);
  const dedNum = annualDeductions.toNumber();

  const annualNet = gross - totalTax - dedNum;

  const buildPeriod = (divisor: number): SalaryPeriod => ({
    gross:          +( gross          / divisor).toFixed(2),
    tax:            +( incomeTax      / divisor).toFixed(2),
    socialSecurity: +( ssTax          / divisor).toFixed(2),
    deductions:     +( dedNum         / divisor).toFixed(2),
    net:            +( annualNet      / divisor).toFixed(2),
  });

  return {
    annual:          buildPeriod(1),
    monthly:         buildPeriod(12),
    biweekly:        buildPeriod(26),
    weekly:          buildPeriod(52),
    effectiveTaxRate: +effectiveTaxRate.toFixed(2),
    marginalRate:    +(marginalRate * 100).toFixed(1),
    slabBreakdown,
    countryConfig:   config,
    currencySymbol:  config.currencySymbol,
  };
}
