import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
            /* Pied AI Core Palette */
            'pied-bg': '#08090d',
            'pied-surface': '#0d0f16',
            'pied-surface-2': '#11131c',
            'pied-border': '#242733',
            'pied-muted': '#747989',
            'pied-text': '#f2f2f0',
            'pied-accent': '#3b82f6',
            'pied-accent-hover': '#2563eb',

            /* Structured Reference */
            'putty': '#c4c3b6',
            'ink': '#000000',
            'bone': '#e7e5e4',
            'chalk': '#ebebeb',
            'vellum': '#dfdcd5',
            'graphite': '#595855',
            'ash': '#808080',

            /* Legacy compatibility */
            "primary": "#3b82f6",
            "background-light": "#f6f6f8",
            "background-dark": "#08090d",

            /* Shadcn color tokens */
  			'color-1': 'hsl(var(--color-1))',
  			'color-2': 'hsl(var(--color-2))',
  			'color-3': 'hsl(var(--color-3))',
  			'color-4': 'hsl(var(--color-4))',
  			'color-5': 'hsl(var(--color-5))',
  		},
        fontFamily: {
            "sans": ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
            "serif": ["Playfair Display", "Georgia", "serif"],
            "display": ["Inter", "sans-serif"],
            "mono": ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "SFMono-Regular", "monospace"],
        },
        borderRadius: {
            /* Pied AI Design System */
            'pied-sm': '2px',
            'pied': '9px',
            'pied-button': '28.8px',
            /* Existing Shadcn */
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            "DEFAULT": "0.5rem",
            "xl": "1.5rem",
            "full": "9999px",
        },
        fontSize: {
            /* Pied AI Typography Scale */
            'pied-body': ['15px', { lineHeight: '1.6' }],
            'pied-body-sm': ['13px', { lineHeight: '1.5' }],
            'pied-subheading': ['22px', { lineHeight: '1.33', letterSpacing: '-0.11px' }],
            'pied-heading-sm': ['26px', { lineHeight: '1.33', letterSpacing: '-0.13px' }],
            'pied-heading': ['43px', { lineHeight: '1.1', letterSpacing: '-0.215px' }],
            'pied-heading-lg': ['52px', { lineHeight: '1', letterSpacing: '-0.47px' }],
        },
  		animation: {
  			ripple: 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
  			gradient: 'gradient 8s linear infinite',
  			marquee: 'marquee var(--duration) infinite linear',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
  			rainbow: 'rainbow var(--speed, 2s) infinite linear',
  			aurora: "aurora 60s linear infinite",
  			'gradient-x': 'gradient-x 15s ease infinite',
  		},
  		keyframes: {
  			ripple: {
  				'0%, 100%': {
  					transform: 'translate(-50%, -50%) scale(1)'
  				},
  				'50%': {
  					transform: 'translate(-50%, -50%) scale(0.9)'
  				}
  			},
  			gradient: {
  				to: {
  					backgroundPosition: 'var(--bg-size) 0'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			},
  			rainbow: {
  				'0%': {
  					'background-position': '0%'
  				},
  				'100%': {
  					'background-position': '200%'
  				}
  			},
            aurora: {
                from: {
                    backgroundPosition: "50% 50%, 50% 50%",
                },
                to: {
                    backgroundPosition: "350% 50%, 350% 50%",
                },
            },
  			'gradient-x': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center'
  				}
  			},
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
