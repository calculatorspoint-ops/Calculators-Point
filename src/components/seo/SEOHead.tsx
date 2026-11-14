/**
 * Client-side metadata for calculator routes.
 */
import { CalculatorConfig } from "@/data/calculatorConfigs";
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '@/config/site';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SEOHead({ calc, catName, isPtBr = false, hasPtBr = false }: { calc: CalculatorConfig; catName: string; isPtBr?: boolean; hasPtBr?: boolean }) {
  const title = calc.metaTitle || `${calc.name} — Free Online Calculator`;
  const description = calc.metaDescription || calc.desc;
  const canonical = `${SITE_URL}${isPtBr ? `/pt-br/calculator/${calc.slug}` : `/calculator/${calc.slug}`}`;
  return <Helmet>
    <title>{title} | Calculators Point</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {hasPtBr && <link rel="alternate" hrefLang="en" href={`${SITE_URL}/calculator/${calc.slug}`} />}
    {hasPtBr && <link rel="alternate" hrefLang="pt-BR" href={`${SITE_URL}/pt-br/calculator/${calc.slug}`} />}
    {hasPtBr && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/calculator/${calc.slug}`} />}
    <meta property="og:type" content="website" />
    <meta property="og:title" content={`${title} | Calculators Point`} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${title} | Calculators Point`} />
    <meta name="twitter:description" content={description} />
    <meta name="keywords" content={`${calc.name}, ${catName} calculator, free online calculator`} />
  </Helmet>;
}
