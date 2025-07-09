import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-border bg-background hover:bg-muted',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted',
        link: 'text-primary-dark underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-2 text-sm [&>svg]:size-5',
        xs: 'h-9 px-3 text-sm [&>svg]:size-4',
        sm: 'h-10 px-4 text-sm [&>svg]:size-4',
        lg: 'h-14 px-8 text-base [&>svg]:size-5',
        icon: 'size-12 [&>svg]:size-5',
        'icon-sm': 'size-10 [&>svg]:size-4',
        'icon-lg': 'size-14 [&>svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
