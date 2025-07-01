// src/components/common/container.tsx
import React, {
  ElementType,
  ReactNode,
  forwardRef,
  useMemo,
} from 'react';
import { classNames } from '@/utils/classNames';

export interface ContainerProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
  className?: string;
  /**
   * Choose one of the predefined max-width variants or 'fluid' for full width.
   */
  variant?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fluid';
  /**
   * Vertical padding variants: 'none', 'sm', 'md', 'lg'.
   */
  py?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Container component
 * - Responsive max-width via `variant` prop (sm..2xl)
 * - Horizontal centering and adaptive padding
 * - Vertical padding control
 * - Forward ref supported
 */
export const Container = forwardRef<
  React.ElementRef<ElementType>,
  ContainerProps<ElementType> & React.ComponentPropsWithoutRef<ElementType>
>(
  (
    {
      as: Component = 'div',
      children,
      className = '',
      variant = '2xl',
      py = 'md',
      ...props
    },
    ref
  ) => {
    const maxWidthClass = useMemo(() => {
      if (variant === 'fluid') return 'max-w-full';
      return {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
      }[variant];
    }, [variant]);

    const paddingYClass = useMemo(() => {
      return {
        none: 'py-0',
        sm: 'py-2',
        md: 'py-4',
        lg: 'py-8',
      }[py];
    }, [py]);

    return (
      <Component
        ref={ref}
        className={classNames(
          'w-full mx-auto px-4 sm:px-6 lg:px-8',
          maxWidthClass,
          paddingYClass,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

export default Container;
