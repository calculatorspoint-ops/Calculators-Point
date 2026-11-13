/**
 * Client-side metadata for calculator routes.
 */
import { CalculatorConfig } from "@/data/calculatorConfigs";
import { Helmet } from 'react-helmet-async';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SEOHead({ calc, catName }: { calc: CalculatorConfig; catName: string }) {
  const title = calc.metaTitle || `${calc.name} — Free Online Calculator`;
  const description = calc.metaDescription || calc.desc;
  const canonical = `https://calculatorspoint.com/calculator/${calc.slug}`;
  return <Helmet>
    <title>{title} | Calculators Point</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={`${title} | Calculators Point`} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content="https://calculatorspoint.com/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${title} | Calculators Point`} />
    <meta name="twitter:description" content={description} />
    <meta name="keywords" content={`${calc.name}, ${catName} calculator, free online calculator`} />
  </Helmet>;
}
