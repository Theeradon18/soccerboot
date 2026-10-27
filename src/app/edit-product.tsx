import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SportButton } from '../components/SportButton';
import { FootballTheme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';

const CATEGORIES = [
  'FG Football Boots',
  'AG Football Boots',
  'TF Football Boots',
  'SG Football Boots',
  'IC Futsal Shoes',
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const product = await api.getProductById(productId);
      setName(product.name || '');
      setBrand(product.brand || '');
      setModel(product.model || '');
      setPrice(String(product.price || ''));
      setColor(product.color || '');
      setSize(product.size || '');
      setStock(String(product.stock ?? ''));
      setCategory(product.category || CATEGORIES[0]);
      setDescription(product.description || '');
      setImageUrl(product.image_url || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Choose image from device
  const handleChooseImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        const msg = 'กรุณาอนุญาตการเข้าถึงรูปภาพในเครื่องเพื่อเลือกรูป';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Permission Denied', msg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPreviewError(false);
        if (asset.base64) {
          setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setImageUrl(asset.uri);
        }
      }
    } catch (err: any) {
      console.error('Image picker error:', err);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อสินค้า');
      return;
    }
    if (!brand.trim()) {
      setErrorMessage('กรุณาระบุแบรนด์สินค้า');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('กรุณาระบุรุ่นสินค้า');
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage('ราคาต้องเป็นตัวเลขที่มากกว่า 0');
      return;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      setErrorMessage('จำนวนสต็อกต้องเป็นตัวเลข 0 ขึ้นไป');
      return;
    }
    if (!size.trim()) {
      setErrorMessage('กรุณาระบุไซส์');
      return;
    }
    if (!color.trim()) {
      setErrorMessage('กรุณาระบุสี');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateProduct(id, {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        price: Number(price),
        stock: Number(stock),
        size: size.trim(),
        color: color.trim(),
        category,
        description: description.trim(),
        image_url: imageUrl.trim(),
      });

      const successMsg = 'แก้ไขข้อมูลสินค้าสำเร็จเรียบร้อย!';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('สำเร็จ', successMsg);
      }

      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || 'แก้ไขสินค้าไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading football boot details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasValidPreview = imageUrl && imageUrl.trim().length > 0 && !previewError;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          disabled={isSubmitting}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={FootballTheme.colors.primary} />
          <Text style={styles.backBtnText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>EDIT BOOTS</Text>

        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.mainLayout, (isDesktop || isTablet) && styles.mainLayoutDesktop]}>
            {/* LEFT: Image Section */}
            <View style={[styles.column, (isDesktop || isTablet) && styles.columnImage]}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="image-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.cardTitle}>Product Image</Text>
                </View>
                <Text style={styles.cardSub}>Update boot photo from device or edit image URL</Text>

                {/* Preview Box */}
                <View style={styles.previewContainer}>
                  {hasValidPreview ? (
                    <View style={styles.previewWrapper}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                        onError={() => setPreviewError(true)}
                      />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => {
                          setImageUrl('');
                          setPreviewError(false);
                        }}>
                        <Text style={styles.removeImageText}>✕ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.placeholderBox}>
                      <Text style={styles.placeholderBall}>⚽</Text>
                      <Text style={styles.placeholderText}>
                        {previewError ? '⚠️ Image URL failed to load' : 'No Image Selected'}
                      </Text>
                      <Text style={styles.placeholderHint}>Upload photo or enter URL</Text>
                    </View>
                  )}
                </View>

                {/* Upload Button */}
                <View style={styles.imageBtnRow}>
                  <SportButton
                    title="Choose from Device"
                    variant="outline"
                    icon={<Ionicons name="cloud-upload-outline" size={16} color={FootballTheme.colors.primary} />}
                    onPress={handleChooseImage}
                    fullWidth
                  />
                </View>

                {/* Image URL Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Or Image URL</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'imageUrl' && styles.inputWrapperFocused,
                    ]}>
                    <Ionicons name="link-outline" size={16} color={FootballTheme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[
                        styles.input,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                      ]}
                      value={imageUrl}
                      onChangeText={(text) => {
                        setImageUrl(text);
                        setPreviewError(false);
                      }}
                      onFocus={() => setFocusedField('imageUrl')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="https://..."
                      placeholderTextColor={FootballTheme.colors.textLight}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* RIGHT: Form Specifications */}
            <View style={[styles.column, (isDesktop || isTablet) && styles.columnForm]}>
              {/* Error Banner */}
              {errorMessage.length > 0 && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color={FootballTheme.colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="pencil-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.cardTitle}>Boots Information</Text>
                </View>

                {/* Product Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Name *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'name' && styles.inputWrapperFocused,
                    ]}>
                    <TextInput
                      style={[
                        styles.input,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                      ]}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Product Name"
                      placeholderTextColor={FootballTheme.colors.textLight}
                    />
                  </View>
                </View>

                {/* Brand & Model Row */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Brand *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'brand' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={brand}
                        onChangeText={setBrand}
                        onFocus={() => setFocusedField('brand')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Brand"
                        placeholderTextColor={FootballTheme.colors.textLight}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Model *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'model' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={model}
                        onChangeText={setModel}
                        onFocus={() => setFocusedField('model')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Model"
                        placeholderTextColor={FootballTheme.colors.textLight}
                      />
                    </View>
                  </View>
                </View>

                {/* Category Picker Chips */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category / Stud Type *</Text>
                  <View style={styles.chipContainer}>
                    {CATEGORIES.map((cat) => {
                      const isActive = category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.chip, isActive && styles.chipActive]}
                          onPress={() => setCategory(cat)}
                          activeOpacity={0.7}>
                          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Price & Stock Row */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Price (฿) *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'price' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={price}
                        onChangeText={setPrice}
                        onFocus={() => setFocusedField('price')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Price"
                        placeholderTextColor={FootballTheme.colors.textLight}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Stock Quantity *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'stock' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={stock}
                        onChangeText={setStock}
                        onFocus={() => setFocusedField('stock')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Stock"
                        placeholderTextColor={FootballTheme.colors.textLight}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Color & Size Row */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Colorway *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'color' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={color}
                        onChangeText={setColor}
                        onFocus={() => setFocusedField('color')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Color"
                        placeholderTextColor={FootballTheme.colors.textLight}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Size *</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'size' && styles.inputWrapperFocused,
                      ]}>
                      <TextInput
                        style={[
                          styles.input,
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                        value={size}
                        onChangeText={setSize}
                        onFocus={() => setFocusedField('size')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Size"
                        placeholderTextColor={FootballTheme.colors.textLight}
                      />
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Description</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      styles.textAreaWrapper,
                      focusedField === 'description' && styles.inputWrapperFocused,
                    ]}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                      ]}
                      value={description}
                      onChangeText={setDescription}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Product Description"
                      placeholderTextColor={FootballTheme.colors.textLight}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Save Changes Button */}
                <View style={styles.submitRow}>
                  <SportButton
                    title="SAVE CHANGES"
                    variant="primary"
                    size="lg"
                    onPress={handleSave}
                    loading={isSubmitting}
                    loadingText="Saving Changes..."
                    disabled={isSubmitting}
                    fullWidth
                    icon={<Ionicons name="save-outline" size={20} color="#FFFFFF" />}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 16,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
  },
  column: {
    width: '100%',
  },
  columnImage: {
    flex: 1,
  },
  columnForm: {
    flex: 1.4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  cardSub: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginBottom: 16,
  },
  previewContainer: {
    height: 220,
    backgroundColor: '#F0F9FF',
    borderRadius: FootballTheme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    marginBottom: 16,
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.sm,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderBall: {
    fontSize: 48,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  placeholderHint: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    marginTop: 2,
  },
  imageBtnRow: {
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FootballTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: FootballTheme.radius.md,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: FootballTheme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.md,
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperFocused: {
    borderColor: FootballTheme.colors.primary,
    backgroundColor: '#FFFFFF',
    ...FootballTheme.shadow.sm,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: FootballTheme.colors.darkNavy,
    fontSize: 14,
    fontWeight: '500',
  },
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textArea: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: FootballTheme.radius.full,
  },
  chipActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
    borderColor: FootballTheme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  chipTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '800',
  },
  submitRow: {
    marginTop: 10,
  },
});
