import type { NextClerkProviderProps } from '@clerk/nextjs/types';

export const clerkAppearance: NextClerkProviderProps['appearance'] = {
  variables: {
    colorPrimary: '#c8ff3d',
    colorPrimaryForeground: '#0b0d12',
    colorBackground: '#14171b',
    colorForeground: '#f4f1e8',
    colorMutedForeground: '#a7aaa4',
    colorInput: '#0b0d12',
    colorInputForeground: '#f4f1e8',
    colorNeutral: '#a7aaa4',
    colorBorder: '#34373b',
    borderRadius: '4px'
  },
  elements: {
    card: { background: '#14171b', boxShadow: 'none', border: '1px solid #34373b' },
    headerTitle: { fontFamily: "Barlow, Impact, sans-serif", textTransform: 'uppercase' },
    formButtonPrimary: { background: '#c8ff3d', color: '#0b0d12', fontSize: '13px' },
    footerActionLink: { color: '#c8ff3d' }
  }
};
