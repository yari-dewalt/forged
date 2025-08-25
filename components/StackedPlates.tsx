import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface StackedPlatesProps {
  weight: number;
  size?: number;
  unit?: 'kg' | 'lbs';
  color?: string;
}

// Standard weight plate dimensions (relative to 45lb plate)
// Format: [diameter ratio, thickness ratio]
const PLATE_DIMENSIONS = {
  45: [1.0, 1.0],    // 45lbs: D: 1.0x T: 1.0x
  35: [0.8, 1.0],    // 35lbs: D: 0.8x T: 1.0x
  25: [0.62, 1.0],   // 25lbs: D: 0.62x T: 1.0x
  10: [0.51, 0.55],  // 10lbs: D: 0.51x T: 0.55x
  5: [0.45, 0.36],   // 5lbs: D: 0.45x T: 0.36x
  2.5: [0.36, 0.32], // 2.5lbs: D: 0.36x T: 0.32x
  1.25: [0.32, 0.3]  // Added small plates for completeness
};

// Maximum plates to show in a single stack
const MAX_PLATES_PER_STACK = 7;

const StackedPlates: React.FC<StackedPlatesProps> = ({ 
  weight, 
  size = 40, 
  unit = 'lbs',
  color = colors.primaryText
}) => {
  // Define standard plate weights in lbs or kg based on unit
  const plateWeights = unit === 'lbs' 
    ? [45, 35, 25, 10, 5, 2.5] 
    : [20, 15, 10, 5, 2.5, 1.25]; // kg equivalents
  
  // Calculate how many plates of each size to show
  let remainingWeight = Math.max(0, weight);
  const plates: number[] = [];
  
  plateWeights.forEach(plateWeight => {
    while (remainingWeight >= plateWeight) {
      plates.push(plateWeight);
      remainingWeight -= plateWeight;
    }
  });
  
  // The width and height of the SVG canvas
  const svgWidth = size;
  const svgHeight = size;
  
  // Base dimensions for a 45lb/20kg plate (largest plate)
  const basePlateWidth = svgWidth * 0.9; // Maximum width for the largest plate
  const basePlateHeight = basePlateWidth * 0.1; // Base thickness for 45lb plate (10% of diameter)
  
  // Create stacks with at most MAX_PLATES_PER_STACK plates per stack
  const stacks: number[][] = [];
  for (let i = 0; i < plates.length; i += MAX_PLATES_PER_STACK) {
    const stackPlates = plates.slice(i, i + MAX_PLATES_PER_STACK);
    stacks.push([...stackPlates].reverse()); // Reverse each stack so largest plates are at the bottom
  }
  
  // Determine number of stacks
  const numStacks = stacks.length || 1;
  
  // Find the tallest stack's height to align all stacks at the bottom
  let tallestStackHeight = 0;
  stacks.forEach(stack => {
    stack.reverse();
    let stackHeight = 0;
    stack.forEach(plateWeight => {
      const lookupWeight = unit === 'kg' 
        ? (plateWeight === 20 ? 45 : 
           plateWeight === 15 ? 35 : 
           plateWeight === 10 ? 25 : 
           plateWeight === 5 ? 10 : 
           plateWeight === 2.5 ? 5 : 2.5)
        : plateWeight;
      
      const dimensionRatio = PLATE_DIMENSIONS[lookupWeight] || [0.3, 0.3];
      stackHeight += basePlateHeight * dimensionRatio[1] + 2;
    });
    tallestStackHeight = Math.max(tallestStackHeight, stackHeight);
  });
  
  // Calculate the starting Y position for the tallest stack
  const baseYPosition = (svgHeight - tallestStackHeight) / 2 + tallestStackHeight;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {stacks.map((stack, stackIndex) => {
          // Adjust base plate width for multiple stacks
          const stackWidth = basePlateWidth / numStacks * 0.9;
          const stackGap = svgWidth * 0.05;
          const stackOffset = (svgWidth - (stackWidth * numStacks + stackGap * (numStacks - 1))) / 2;
          const startX = stackOffset + stackIndex * (stackWidth + stackGap);
          
          // Calculate total height of this stack
          let stackHeight = 0;
          stack.forEach(plateWeight => {
            const lookupWeight = unit === 'kg' 
              ? (plateWeight === 20 ? 45 : 
                 plateWeight === 15 ? 35 : 
                 plateWeight === 10 ? 25 : 
                 plateWeight === 5 ? 10 : 
                 plateWeight === 2.5 ? 5 : 2.5)
              : plateWeight;
            
            const dimensionRatio = PLATE_DIMENSIONS[lookupWeight] || [0.3, 0.3];
            stackHeight += basePlateHeight * dimensionRatio[1] + 2;
          });
          
          // Calculate plate positions starting from the bottom of the stack
          const platePositions: { weight: number, y: number }[] = [];
          let currentY = baseYPosition;
          
          // Go bottom to top, calculating positions
          for (let i = 0; i < stack.length; i++) {
            const plateWeight = stack[i];
            const lookupWeight = unit === 'kg' 
              ? (plateWeight === 20 ? 45 : 
                 plateWeight === 15 ? 35 : 
                 plateWeight === 10 ? 25 : 
                 plateWeight === 5 ? 10 : 
                 plateWeight === 2.5 ? 5 : 2.5)
              : plateWeight;
            
            const dimensionRatio = PLATE_DIMENSIONS[lookupWeight] || [0.3, 0.3];
            const plateHeight = basePlateHeight * dimensionRatio[1];
            
            currentY -= (plateHeight + 2);
            platePositions.push({ weight: plateWeight, y: currentY });
          }
          
          // Now render each plate using the calculated positions
          return platePositions.map((plate, plateIndex) => {
            const lookupWeight = unit === 'kg' 
              ? (plate.weight === 20 ? 45 : 
                 plate.weight === 15 ? 35 : 
                 plate.weight === 10 ? 25 : 
                 plate.weight === 5 ? 10 : 
                 plate.weight === 2.5 ? 5 : 2.5)
              : plate.weight;
            
            // Get dimension ratios for this plate weight
            const dimensionRatio = PLATE_DIMENSIONS[lookupWeight] || [0.3, 0.3];
            
            // Calculate plate width and height based on ratios
            const plateWidth = stackWidth * dimensionRatio[0];
            const plateHeight = basePlateHeight * dimensionRatio[1];
            
            // Center the plate horizontally
            const xPosition = startX + (stackWidth - plateWidth) / 2;
            
            return (
              <Rect
                key={`stack-${stackIndex}-plate-${plateIndex}`}
                x={xPosition}
                y={plate.y}
                width={plateWidth}
                height={plateHeight}
                fill={color}
                stroke="white"
                strokeWidth={1}
                rx={1 / numStacks}
              />
            );
          });
        }).flat()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default StackedPlates;