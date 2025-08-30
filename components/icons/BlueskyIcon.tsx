import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BlueskyIconProps {
  size?: number;
  color?: string;
}

export const BlueskyIcon: React.FC<BlueskyIconProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 2.104.139 3.309.02 5.448.02 6.781c0 2.056.329 5.086 2.127 6.895 1.798 1.809 4.508 1.900 6.25 1.908.426.002.799-.054 1.103-.135-.803-.956-.897-2.777-.897-4.449zm0 0c1.087-2.114 4.046-6.053 6.798-7.995C21.434.944 22.439 1.266 23.098 2.104c.763 1.205.882 3.344.882 4.677 0 2.056-.329 5.086-2.127 6.895-1.798 1.809-4.508 1.900-6.25 1.908-.426.002-.799-.054-1.103-.135.803-.956.897-2.777.897-4.449z"
        fill={color}
      />
    </Svg>
  );
};
