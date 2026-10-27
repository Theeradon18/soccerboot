import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';
import { SportButton } from './SportButton';

interface DeleteConfirmModalProps {
  visible: boolean;
  productName: string;
  brand?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  productName,
  brand,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={isDeleting ? undefined : onCancel}>
      <TouchableWithoutFeedback onPress={isDeleting ? undefined : onCancel}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}>
              {/* Football Penalty / Red Card Accent Icon */}
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🟥</Text>
              </View>

              <Text style={styles.modalTitle}>Delete Product?</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to delete this football boot? This action cannot be undone.
              </Text>

              {/* Target Item Preview Card */}
              <View style={styles.targetCard}>
                {brand ? (
                  <Text style={styles.brandText}>{brand.toUpperCase()}</Text>
                ) : null}
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <View style={styles.buttonWrapper}>
                  <SportButton
                    title="Cancel"
                    variant="outline"
                    onPress={onCancel}
                    disabled={isDeleting}
                    fullWidth
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <SportButton
                    title="Delete"
                    variant="danger"
                    onPress={onConfirm}
                    loading={isDeleting}
                    loadingText="Deleting..."
                    disabled={isDeleting}
                    fullWidth
                  />
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 24,
    alignItems: 'center',
    ...FootballTheme.shadow.lg,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: FootballTheme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  targetCard: {
    width: '100%',
    backgroundColor: FootballTheme.colors.background,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.md,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
