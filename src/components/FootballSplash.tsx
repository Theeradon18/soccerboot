import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';

interface FootballSplashProps {
  onFinish: () => void;
}

export const FootballSplash: React.FC<FootballSplashProps> = ({ onFinish }) => {
  // Animation Values
  const ballPositionX = useRef(new Animated.Value(-160)).current;
  const ballPositionY = useRef(new Animated.Value(120)).current;
  const ballRotation = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(0.7)).current;

  const goalNetShake = useRef(new Animated.Value(0)).current;
  const goalRippleScale = useRef(new Animated.Value(0.2)).current;
  const goalRippleOpacity = useRef(new Animated.Value(0)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(15)).current;

  const screenFadeOut = useRef(new Animated.Value(1)).current;

  const hasFinishedRef = useRef(false);

  const complete = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    // Stage 1: Ball bounce and shoot toward goal
    const ballTravel = Animated.parallel([
      // X Movement: Across screen into goal
      Animated.timing(ballPositionX, {
        toValue: 0,
        duration: 900,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // Y Movement: Bounce arc then strike upward
      Animated.sequence([
        Animated.timing(ballPositionY, {
          toValue: -40,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ballPositionY, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Scale: gets closer
      Animated.timing(ballScale, {
        toValue: 1.15,
        duration: 900,
        useNativeDriver: true,
      }),
      // Rotation: Fast spin
      Animated.timing(ballRotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    // Stage 2: Ball hits net - Net shake & Goal Ripple
    const netImpact = Animated.parallel([
      // Goal ripple
      Animated.sequence([
        Animated.timing(goalRippleOpacity, {
          toValue: 0.8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(goalRippleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(goalRippleScale, {
        toValue: 2.2,
        duration: 480,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Net vibration shake
      Animated.sequence([
        Animated.timing(goalNetShake, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(goalNetShake, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(goalNetShake, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(goalNetShake, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(goalNetShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]);

    // Stage 3: Reveal BOOTZONE & FOOTBALL BOOTS STORE
    const brandReveal = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 150,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]);

    // Stage 4: Fade out intro screen
    const exitScreen = Animated.sequence([
      Animated.delay(650),
      Animated.timing(screenFadeOut, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]);

    // Run entire choreography
    Animated.sequence([
      ballTravel,
      netImpact,
      brandReveal,
      exitScreen,
    ]).start(() => {
      complete();
    });

    // Fallback safety timer
    const timer = setTimeout(() => {
      complete();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const spin = ballRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeOut }]}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={complete}
        activeOpacity={0.7}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
        <Text style={styles.skipText}>Skip ⏭️</Text>
      </TouchableOpacity>

      {/* Football Pitch Background Geometry */}
      <View style={styles.pitchPattern}>
        <View style={styles.pitchCenterCircle} />
        <View style={styles.pitchHalfLine} />
        <View style={styles.pitchBox} />
      </View>

      {/* Goal Area Container */}
      <Animated.View
        style={[
          styles.goalContainer,
          {
            transform: [{ translateX: goalNetShake }],
          },
        ]}>
        {/* Goal Ripple Effect */}
        <Animated.View
          style={[
            styles.goalRipple,
            {
              opacity: goalRippleOpacity,
              transform: [{ scale: goalRippleScale }],
            },
          ]}
        />

        {/* Goal Frame & Net */}
        <View style={styles.goalFrame}>
          <View style={styles.goalCrossbar} />
          <View style={styles.goalNet}>
            <View style={styles.netLineH1} />
            <View style={styles.netLineH2} />
            <View style={styles.netLineV1} />
            <View style={styles.netLineV2} />
            <View style={styles.netLineV3} />
          </View>
        </View>

        {/* The Football */}
        <Animated.View
          style={[
            styles.ballWrapper,
            {
              transform: [
                { translateX: ballPositionX },
                { translateY: ballPositionY },
                { scale: ballScale },
                { rotate: spin },
              ],
            },
          ]}>
          <Text style={styles.footballIcon}>⚽</Text>
        </Animated.View>
      </Animated.View>

      {/* Branding Logo & Subtitle */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>OFFICIAL CLEATS STORE</Text>
        </View>

        <Text style={styles.logoTitle}>BOOTZONE</Text>

        <Animated.View
          style={[
            styles.subtitleWrapper,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}>
          <View style={styles.speedLineLeft} />
          <Text style={styles.logoSubtitle}>FOOTBALL BOOTS STORE</Text>
          <View style={styles.speedLineRight} />
        </Animated.View>

        <Text style={styles.tagline}>Premium Speed & Control Cleats</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F5FAFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
    zIndex: 10000,
    ...FootballTheme.shadow.sm,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  pitchPattern: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.12,
  },
  pitchCenterCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: FootballTheme.colors.primary,
  },
  pitchHalfLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: FootballTheme.colors.primary,
  },
  pitchBox: {
    position: 'absolute',
    top: 40,
    width: 320,
    height: 120,
    borderWidth: 2,
    borderColor: FootballTheme.colors.primary,
  },
  goalContainer: {
    width: 200,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  goalRipple: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: FootballTheme.colors.sky,
  },
  goalFrame: {
    width: 180,
    height: 110,
    borderWidth: 5,
    borderBottomWidth: 0,
    borderColor: FootballTheme.colors.primary,
    borderRadius: 8,
    backgroundColor: 'rgba(224, 242, 254, 0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  goalCrossbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: FootballTheme.colors.sky,
  },
  goalNet: {
    flex: 1,
    position: 'relative',
  },
  netLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(11, 116, 222, 0.25)',
  },
  netLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(11, 116, 222, 0.25)',
  },
  netLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '25%',
    width: 1,
    backgroundColor: 'rgba(11, 116, 222, 0.25)',
  },
  netLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(11, 116, 222, 0.25)',
  },
  netLineV3: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '75%',
    width: 1,
    backgroundColor: 'rgba(11, 116, 222, 0.25)',
  },
  ballWrapper: {
    position: 'absolute',
  },
  footballIcon: {
    fontSize: 54,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  badgePill: {
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1.2,
  },
  logoTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  speedLineLeft: {
    width: 24,
    height: 2,
    backgroundColor: FootballTheme.colors.primary,
  },
  speedLineRight: {
    width: 24,
    height: 2,
    backgroundColor: FootballTheme.colors.primary,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
});
