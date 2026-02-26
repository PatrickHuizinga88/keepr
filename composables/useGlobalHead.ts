import { THEME_COLORS as themeColors } from "~/constants";

export function useGlobalHead(theme: 'purple' | 'pink' | 'blue' | 'green' | 'red' | 'orange') {
  if (!theme) return

  const { primary, background } = themeColors[theme]

  useHead({
    style: [
      {
        innerHTML: `
          :root {
            --background: ${background} !important;
            --primary: ${primary} !important;
          }
        `,
      },
    ],
  })
}