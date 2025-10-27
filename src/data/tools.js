// Tool categories with their tools
export const toolCategories = [
  {
    id: 'invoicing',
    nameKey: 'categories.invoicing',
    icon: 'ReceiptLong',
    tools: [
      { slug: 'invoice-generator', titleKey: 'tools.invoiceGenerator.title', descriptionKey: 'tools.invoiceGenerator.description' },
      { slug: 'proforma-invoice-generator', titleKey: 'tools.proformaInvoiceGenerator.title', descriptionKey: 'tools.proformaInvoiceGenerator.description' },
      { slug: 'invoice-calculator', titleKey: 'tools.invoiceCalculator.title', descriptionKey: 'tools.invoiceCalculator.description' }
    ]
  },
  {
    id: 'conversion',
    nameKey: 'categories.conversion',
    icon: 'SwapHoriz',
    tools: [
      { slug: 'unit-converter', titleKey: 'tools.unitConverter.title', descriptionKey: 'tools.unitConverter.description' },
      { slug: 'base64-converter', titleKey: 'tools.base64Converter.title', descriptionKey: 'tools.base64Converter.description' },
      { slug: 'base-converter', titleKey: 'tools.baseConverter.title', descriptionKey: 'tools.baseConverter.description' },
      { slug: 'timestamp-converter', titleKey: 'tools.timestampConverter.title', descriptionKey: 'tools.timestampConverter.description' },
      { slug: 'color-converter', titleKey: 'tools.colorConverter.title', descriptionKey: 'tools.colorConverter.description' }
    ]
  },
  {
    id: 'calculators',
    nameKey: 'categories.calculators',
    icon: 'Calculate',
    tools: [
      { slug: 'calculator', titleKey: 'tools.calculator.title', descriptionKey: 'tools.calculator.description' },
      { slug: 'percentage-calculator', titleKey: 'tools.percentageCalculator.title', descriptionKey: 'tools.percentageCalculator.description' }
    ]
  },
  {
    id: 'textGenerators',
    nameKey: 'categories.textGenerators',
    icon: 'TextFields',
    tools: [
      { slug: 'password-generator', titleKey: 'tools.passwordGenerator.title', descriptionKey: 'tools.passwordGenerator.description' },
      { slug: 'slug-generator', titleKey: 'tools.slugGenerator.title', descriptionKey: 'tools.slugGenerator.description' },
      { slug: 'cnp-generator', titleKey: 'tools.cnpGenerator.title', descriptionKey: 'tools.cnpGenerator.description' },
      { slug: 'lorem-ipsum', titleKey: 'tools.loremIpsum.title', descriptionKey: 'tools.loremIpsum.description' },
      { slug: 'uuid-generator', titleKey: 'tools.uuidGenerator.title', descriptionKey: 'tools.uuidGenerator.description' },
      { slug: 'qr-generator', titleKey: 'tools.qrGenerator.title', descriptionKey: 'tools.qrGenerator.description' }
    ]
  },
  {
    id: 'textUtilities',
    nameKey: 'categories.textUtilities',
    icon: 'Article',
    tools: [
      { slug: 'word-counter', titleKey: 'tools.wordCounter.title', descriptionKey: 'tools.wordCounter.description' },
      { slug: 'text-compressor', titleKey: 'tools.textCompressor.title', descriptionKey: 'tools.textCompressor.description' },
      { slug: 'text-cipher', titleKey: 'tools.textCipher.title', descriptionKey: 'tools.textCipher.description' },
      { slug: 'text-analyzer', titleKey: 'tools.textAnalyzer.title', descriptionKey: 'tools.textAnalyzer.description' },
      { slug: 'palindrome-checker', titleKey: 'tools.palindromeChecker.title', descriptionKey: 'tools.palindromeChecker.description' }
    ]
  },
  {
    id: 'colors',
    nameKey: 'categories.colors',
    icon: 'Palette',
    tools: [
      { slug: 'color-extractor', titleKey: 'tools.colorExtractor.title', descriptionKey: 'tools.colorExtractor.description' },
      { slug: 'gradient-generator', titleKey: 'tools.gradientGenerator.title', descriptionKey: 'tools.gradientGenerator.description' },
      { slug: 'contrast-checker', titleKey: 'tools.contrastChecker.title', descriptionKey: 'tools.contrastChecker.description' }
    ]
  },
  {
    id: 'cssDesign',
    nameKey: 'categories.cssDesign',
    icon: 'Style',
    tools: [
      { slug: 'css-shadow-generator', titleKey: 'tools.cssShadowGenerator.title', descriptionKey: 'tools.cssShadowGenerator.description' },
      { slug: 'css-border-generator', titleKey: 'tools.cssBorderGenerator.title', descriptionKey: 'tools.cssBorderGenerator.description' },
      { slug: 'css-animation-generator', titleKey: 'tools.cssAnimationGenerator.title', descriptionKey: 'tools.cssAnimationGenerator.description' },
      { slug: 'flexbox-generator', titleKey: 'tools.flexboxGenerator.title', descriptionKey: 'tools.flexboxGenerator.description' },
      { slug: 'grid-generator', titleKey: 'tools.gridGenerator.title', descriptionKey: 'tools.gridGenerator.description' },
      { slug: 'css-typography-generator', titleKey: 'tools.cssTypographyGenerator.title', descriptionKey: 'tools.cssTypographyGenerator.description' },
      { slug: 'hover-effect-generator', titleKey: 'tools.hoverEffectGenerator.title', descriptionKey: 'tools.hoverEffectGenerator.description' },
      { slug: 'background-generator', titleKey: 'tools.backgroundGenerator.title', descriptionKey: 'tools.backgroundGenerator.description' },
      { slug: 'pseudo-element-generator', titleKey: 'tools.pseudoElementGenerator.title', descriptionKey: 'tools.pseudoElementGenerator.description' },
      { slug: 'transform-generator', titleKey: 'tools.transformGenerator.title', descriptionKey: 'tools.transformGenerator.description' },
      { slug: 'filter-generator', titleKey: 'tools.filterGenerator.title', descriptionKey: 'tools.filterGenerator.description' }
    ]
  },
  {
    id: 'development',
    nameKey: 'categories.development',
    icon: 'Code',
    tools: [
      { slug: 'code-minifier', titleKey: 'tools.codeMinifier.title', descriptionKey: 'tools.codeMinifier.description' },
      { slug: 'regex-generator', titleKey: 'tools.regexGenerator.title', descriptionKey: 'tools.regexGenerator.description' },
      { slug: 'markdown-compiler', titleKey: 'tools.markdownCompiler.title', descriptionKey: 'tools.markdownCompiler.description' },
      { slug: 'table-generator', titleKey: 'tools.tableGenerator.title', descriptionKey: 'tools.tableGenerator.description' },
      { slug: 'form-generator', titleKey: 'tools.formGenerator.title', descriptionKey: 'tools.formGenerator.description' }
    ]
  },
  {
    id: 'utilities',
    nameKey: 'categories.utilities',
    icon: 'Widgets',
    tools: [
      { slug: 'timer', titleKey: 'tools.timer.title', descriptionKey: 'tools.timer.description' },
      { slug: 'world-clock', titleKey: 'tools.worldClock.title', descriptionKey: 'tools.worldClock.description' },
      { slug: 'shortcut-simulator', titleKey: 'tools.shortcutSimulator.title', descriptionKey: 'tools.shortcutSimulator.description' },
      { slug: 'dice-simulator', titleKey: 'tools.diceSimulator.title', descriptionKey: 'tools.diceSimulator.description' },
      { slug: 'ascii-chart', titleKey: 'tools.asciiChart.title', descriptionKey: 'tools.asciiChart.description' }
    ]
  }
];

// Flat list of all tools for backward compatibility
export const tools = toolCategories.flatMap(category => category.tools);

export const getToolBySlug = (slug) => tools.find((tool) => tool.slug === slug);

export const getCategoryByToolSlug = (slug) => {
  return toolCategories.find(category => 
    category.tools.some(tool => tool.slug === slug)
  );
};
