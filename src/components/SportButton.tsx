import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { FootballTheme } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface SportButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const SportButton: React.FC<SportButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  iconRight,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 80,
    }).start();
  };

  const isInteractive = !disabled && !loading;

  // Determine button styles based on variant
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: FootballTheme.colors.primary,
          borderColor: FootballTheme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: FootballTheme.colors.darkNavy,
          borderColor: FootballTheme.colors.darkNavy,
        };
      case 'danger':
        return {
          backgroundColor: FootballTheme.colors.danger,
          borderColor: FootballTheme.colors.danger,
        };
      case 'success':
        return {
          backgroundColor: FootballTheme.colors.success,
          borderColor: FootballTheme.colors.success,
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          borderColor: FootballTheme.colors.primary,
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: FootballTheme.colors.primary,
          borderColor: FootballTheme.colors.primary,
        };
    }
  };

  // Determine text styles based on variant
  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return {
          color: FootballTheme.colors.primary,
          fontWeight: '700',
        };
      default:
        return {
          color: '#FFFFFF',
          fontWeight: '700',
        };
    }
  };

  // Determine size padding
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: FootballTheme.radius.md,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: FootballTheme.radius.lg,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: FootballTheme.radius.md,
        };
    }
  };

  const getFontSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 13 };
      case 'lg':
        return { fontSize: 16, letterSpacing: 0.5 };
      case 'md':
      default:
        return { fontSize: 14 };
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && styles.fullWidth,
      ]}>
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isInteractive}
        style={({ pressed }) => [
          styles.baseButton,
          getSizeStyle(),
          getVariantStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          pressed && isInteractive && styles.pressedState,
          Platform.OS === 'web' && ({ cursor: isInteractive ? 'pointer' : 'not-allowed' } as any),
          style,
        ]}>
        <View style={styles.contentRow}>
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color={variant === 'outline' || variant === 'ghost' ? FootballTheme.colors.primary : '#FFFFFF'}
                style={styles.spinner}
              />
              <Text style={[styles.baseText, getTextStyle(), getFontSize(), textStyle]}>
                {loadingText || title}
              </Text>
            </>
          ) : (
            <>
              {icon && <View style={styles.iconLeft}>{icon}</View>}
              <Text style={[styles.baseText, getTextStyle(), getFontSize(), textStyle]}>
                {title}
              </Text>
              {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...FootballTheme.shadow.sm,
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    textAlign: 'center',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressedState: {
    opacity: 0.9,
  },
  spinner: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
