import { Platform, useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  columns: number;
  containerPadding: number;
  maxContentWidth: number;
  isWeb: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  let columns = 1;
  if (width >= 1200) {
    columns = 4;
  } else if (width >= 900) {
    columns = 3;
  } else if (width >= 580) {
    columns = 2;
  } else {
    columns = 1;
  }

  const containerPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const maxContentWidth = 1240;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    columns,
    containerPadding,
    maxContentWidth,
    isWeb: Platform.OS === 'web',
  };
}
