import React from 'react';

interface ReclubIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const ReclubIcon: React.FC<ReclubIconProps> = ({
  className = 'w-4 h-4',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19.5,10.4c.2-.5.6-2.7,0-4.5-.8-2-2.5-3.4-4.8-3.7H6.2c0,6.2,0,12.4,0,18.6,0,.8.5,1.6,1.4,1.6,1.1,0,1.9-.6,1.9-1.6v-6.7s1,0,1,0l5.7,8c.7.5,1.6.4,2.2-.1.6-.5.8-1.5.4-2.2l-7-9.5-3.1.6"
      />
      <path
        d="M9.8,7.2l1.7-.2c1,0,1.8.7,1.8,1.6,0,.7-.7,1.5-1.5,1.8"
      />
      <path
        d="M15,14.5c.6.2,1.7-.1,2.2-.6.5-.5.6-1.4.2-2l-2.7-3.2s-.7-.3-1.3,0"
      />
      <path
        d="M14.6,8.7s.5-.9,1.6-1.1,1.2.4,1.2.4l1.9,2.1s.6,1.2,0,2-1.9.7-1.9.7"
      />
    </svg>
  );
};
