import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "udeps",
  description: "JS micro-dependencies",
  themeConfig: {
    nav: [],

    sidebar: [
      {
        text: 'Registry',
        items: [
          { text: 'main', link: '/registry/main' },
          { text: 'compat', link: '/registry/compat' },
          { text: 'crossrealm', link: '/registry/crossrealm' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hamish-milne/udeps' }
    ]
  }
})
