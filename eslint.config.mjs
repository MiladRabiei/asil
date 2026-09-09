import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  {
    ignores: [
      'src/lib/axiosInstance.ts',
      'src/lib/serverGraphql.ts',
      'src/lib/serverApi.ts',
      'node_modules',
      'dist',
      'build',
      '.next',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,

  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': false,
          'ts-expect-error': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      'src/hoc/**',
      'src/lib/server/**',
      'src/app/question/createByWord/_components/WordFileQuestionUploadFlow.tsx',
      'src/shared/UI/FileInput/index.tsx',
      '**/hook.mutation.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  { files: ['**/hook.mutation.tsx'], rules: { 'react-hooks/rules-of-hooks': 'off' } },
];

export default eslintConfig;
