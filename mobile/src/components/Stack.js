import React from 'react';
import { View } from 'react-native';
import { spacing } from '../styles/theme';

const flattenChildren = (children) =>
  React.Children.toArray(children).flatMap((child) => {
    if (child?.type === React.Fragment) {
      return flattenChildren(child.props.children);
    }
    return [child];
  });

const Stack = ({
  children,
  gap = spacing.md,
  direction = 'column',
  wrap = false,
  align,
  justify,
  style
}) => {
  const items = flattenChildren(children).filter(Boolean);
  const isRow = direction === 'row';

  const spacedChildren = items.map((child, index) => {
    if (!React.isValidElement(child)) return child;

    const isLast = index === items.length - 1;
    const spacingStyle = wrap
      ? {
          marginRight: isRow ? gap : 0,
          marginBottom: gap
        }
      : isRow
        ? { marginRight: isLast ? 0 : gap }
        : { marginBottom: isLast ? 0 : gap };

    const childStyle = child.props?.style;
    return React.cloneElement(child, { style: [childStyle, spacingStyle] });
  });

  return (
    <View
      style={[
        {
          flexDirection: direction,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          alignItems: align,
          justifyContent: justify
        },
        style
      ]}
    >
      {spacedChildren}
    </View>
  );
};

export default Stack;
