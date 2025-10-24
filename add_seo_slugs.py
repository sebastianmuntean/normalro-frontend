#!/usr/bin/env python3
"""
Script pentru adăugarea prop-ului seoSlug la toate tool-urile care folosesc ToolLayout
"""

import os
import re

# Mapping între nume fișier și slug SEO
SLUG_MAPPING = {
    'AsciiChart.js': 'ascii-chart',
    'BackgroundGenerator.js': 'background-generator',
    'BaseConverter.js': 'base-converter',
    'CssAnimationGenerator.js': 'css-animation-generator',
    'CssBorderGenerator.js': 'css-border-generator',
    'CssShadowGenerator.js': 'css-shadow-generator',
    'CssTypographyGenerator.js': 'css-typography-generator',
    'ColorConverter.js': 'color-converter',
    'ContrastChecker.js': 'contrast-checker',
    'DiceSimulator.js': 'dice-simulator',
    'FilterGenerator.js': 'filter-generator',
    'FlexboxGenerator.js': 'flexbox-generator',
    'FormGenerator.js': 'form-generator',
    'GradientGenerator.js': 'gradient-generator',
    'GridGenerator.js': 'grid-generator',
    'HoverEffectGenerator.js': 'hover-effect-generator',
    'LoremIpsumGenerator.js': 'lorem-ipsum',
    'MarkdownCompiler.js': 'markdown-compiler',
    'PalindromeChecker.js': 'palindrome-checker',
    'PercentageCalculator.js': 'percentage-calculator',
    'PseudoElementGenerator.js': 'pseudo-element-generator',
    'RegexGenerator.js': 'regex-generator',
    'ShortcutSimulator.js': 'shortcut-simulator',
    'TableGenerator.js': 'table-generator',
    'TextAnalyzer.js': 'text-analyzer',
    'TextCipher.js': 'text-cipher',
    'TimestampConverter.js': 'timestamp-converter',
    'TransformGenerator.js': 'transform-generator',
    'UuidGenerator.js': 'uuid-generator',
    'WorldClock.js': 'world-clock',
}

def add_seo_slug(file_path, slug):
    """Adaugă seoSlug la componenta ToolLayout din fișier"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pentru a găsi <ToolLayout cu props
    # Caută ToolLayout fără seoSlug
    if 'seoSlug=' in content:
        print(f"  [OK] {os.path.basename(file_path)} - deja are seoSlug")
        return False
    
    # Pattern pentru ToolLayout cu props pe o linie
    pattern_single = r'(<ToolLayout\s+[^>]*?)(\s*>)'
    
    # Pattern pentru ToolLayout cu props pe mai multe linii
    pattern_multi = r'(<ToolLayout\s+[^>]*?)(>)'
    
    # Verifică dacă are ToolLayout
    if not re.search(r'<ToolLayout\s', content):
        print(f"  [X] {os.path.basename(file_path)} - nu foloseste ToolLayout")
        return False
    
    # Adaugă seoSlug
    modified = False
    
    # Încearcă pattern single line
    if re.search(pattern_single, content):
        new_content = re.sub(
            pattern_single,
            rf'\1 seoSlug="{slug}"\2',
            content,
            count=1
        )
        if new_content != content:
            content = new_content
            modified = True
    
    # Dacă nu a funcționat, încearcă pattern multi-line
    if not modified and re.search(pattern_multi, content, re.DOTALL):
        new_content = re.sub(
            pattern_multi,
            rf'\1 seoSlug="{slug}"\2',
            content,
            count=1,
            flags=re.DOTALL
        )
        if new_content != content:
            content = new_content
            modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [OK] {os.path.basename(file_path)} - seoSlug adaugat!")
        return True
    else:
        print(f"  [X] {os.path.basename(file_path)} - nu s-a putut adauga seoSlug")
        return False

def main():
    tools_dir = os.path.join('src', 'pages', 'tools')
    
    if not os.path.exists(tools_dir):
        print(f"[ERROR] Director {tools_dir} nu exista!")
        return
    
    print("[*] Adaugare seoSlug la tool-uri...\n")
    
    modified_count = 0
    
    for filename, slug in SLUG_MAPPING.items():
        file_path = os.path.join(tools_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"  [!] {filename} - fisier nu exista")
            continue
        
        if add_seo_slug(file_path, slug):
            modified_count += 1
    
    print(f"\n[OK] Finalizat! {modified_count}/{len(SLUG_MAPPING)} fisiere modificate")

if __name__ == '__main__':
    main()

