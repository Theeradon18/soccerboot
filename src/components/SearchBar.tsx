import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  categories?: string[];
}

export const CATEGORY_FILTERS = [
  'All',
  'FG Football Boots',
  'AG Football Boots',
  'TF Football Boots',
  'SG Football Boots',
  'IC Futsal Shoes',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search football boots (Name, Brand, Model, Color)...',
  selectedCategory = 'All',
  onSelectCategory,
  categories = CATEGORY_FILTERS,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Search Input Box */}
      <View style={[styles.inputBox, isFocused && styles.inputBoxFocused]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={isFocused ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={FootballTheme.colors.textLight}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClear}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={FootballTheme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      {onSelectCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const shortLabel = cat.replace(' Football Boots', '').replace(' Shoes', '');

            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => onSelectCategory(cat)}
                activeOpacity={0.7}>
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat === 'All' ? '⚡ All Boots' : `👟 ${shortLabel}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  inputBoxFocused: {
    borderColor: FootballTheme.colors.primary,
    ...FootballTheme.shadow.md,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: FootballTheme.colors.darkNavy,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: FootballTheme.radius.full,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  chipSelected: {
    backgroundColor: FootballTheme.colors.primary,
    borderColor: FootballTheme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
