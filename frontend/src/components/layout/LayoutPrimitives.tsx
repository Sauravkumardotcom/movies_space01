import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  className = '',
}) => {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto w-full px-4 ${maxWidths[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};

interface GridProps {
  children: React.ReactNode;
  cols?: number | { mobile: number; tablet: number; desktop: number };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  className = '',
}) => {
  const gaps = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  let colClasses = 'grid-cols-1';
  if (typeof cols === 'number') {
    colClasses = `grid-cols-${cols}`;
  } else {
    colClasses = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  }

  return (
    <div className={`grid ${colClasses} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'between' | 'around' | 'end';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '',
}) => {
  const directionClass = direction === 'col' ? 'flex-col' : 'flex-row';
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    end: 'justify-end',
  }[justify];
  const gapClass = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }[gap];
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div
      className={`flex ${directionClass} ${alignClass} ${justifyClass} ${gapClass} ${wrapClass} ${className}`}
    >
      {children}
    </div>
  );
};

interface StackProps {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const VStack: React.FC<StackProps> = ({ children, gap = 'md', className = '' }) => (
  <Flex direction="col" gap={gap} className={className}>
    {children}
  </Flex>
);

export const HStack: React.FC<StackProps> = ({ children, gap = 'md', className = '' }) => (
  <Flex direction="row" gap={gap} className={className}>
    {children}
  </Flex>
);

interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  onClick,
}) => {
  const { tokens } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: tokens.colors.surface,
        borderColor: tokens.colors.border,
        boxShadow: tokens.shadows.sm,
      }}
      className={`
        border rounded-lg p-4 transition-all duration-200
        ${interactive ? 'hover:shadow-md hover:scale-105 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => {
  const { tokens } = useTheme();

  return (
    <section className={`py-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2
            style={{ color: tokens.colors.text }}
            className="text-2xl font-bold mb-1"
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: tokens.colors.textMuted }} className="text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md' }) => {
  const sizes = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16',
    '3xl': 'h-20',
  };
  return <div className={sizes[size]} />;
};
