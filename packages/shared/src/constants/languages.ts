export const SupportedLanguages = {
  CPP: 'cpp',
  PYTHON: 'python',
} as const;

export type SupportedLanguage = (typeof SupportedLanguages)[keyof typeof SupportedLanguages];

export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = Object.values(SupportedLanguages);

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  version: string;
  extension: string;
  monacoLanguage: string;
  starterCode: string;
  compileBudgetMs: number;
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  [SupportedLanguages.CPP]: {
    id: SupportedLanguages.CPP,
    name: 'C++ (GCC 12 / C++17)',
    version: 'C++17',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    starterCode: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution here
    
    return 0;
}
`,
    compileBudgetMs: 10000,
  },
  [SupportedLanguages.PYTHON]: {
    id: SupportedLanguages.PYTHON,
    name: 'Python 3',
    version: '3.11',
    extension: 'py',
    monacoLanguage: 'python',
    starterCode: `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Write your solution here

if __name__ == '__main__':
    main()
`,
    compileBudgetMs: 0,
  },
};
