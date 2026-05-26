export const theme = {
  colors: {
    background: '#0b1326',
    surface: '#131b2e',
    surfaceRaised: '#171f33',
    surfaceHigh: '#222a3d',
    surfaceHighest: '#2d3449',
    primary: '#c0c1ff',
    primaryStrong: '#8083ff',
    onPrimary: '#1000a9',
    secondary: '#b9c8de',
    tertiary: '#ffb783',
    error: '#ffb4ab',
    adBackground: '#26324b',
    text: '#dae2fd',
    textMuted: '#c7c4d7',
    outline: '#908fa0',
    outlineSubtle: '#464554',
    success: '#9ee7d8',
    successStrong: '#2ec7a6',
    warning: '#ffcf91',
    scrim: 'rgba(3, 8, 19, 0.78)'
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    pill: 999
  },
  spacing: (n: number) => n * 8,
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '800' as const
    },
    sectionTitle: {
      fontSize: 27,
      fontWeight: '800' as const
    },
    body: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24
    },
    label: {
      fontSize: 12,
      fontWeight: '800' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8
    }
  }
};
