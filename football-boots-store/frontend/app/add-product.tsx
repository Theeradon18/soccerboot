import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

const CATEGORIES = [
  'FG Football Boots',
  'AG Football Boots',
  'TF Football Boots',
  'SG Football Boots',
  'IC Futsal Shoes',
];

export default function AddProductScreen() {
  const router = useRouter();

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Method 1: Choose image from device
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
      const msg = 'เกิดข้อผิดพลาดในการเลือกรูปภาพ';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  // Form Validation & Submit
  const handleSubmit = async () => {
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อสินค้า (Product Name)');
      return;
    }
    if (!brand.trim()) {
      setErrorMessage('กรุณาระบุแบรนด์สินค้า (Brand)');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('กรุณาระบุรุ่นสินค้า (Model)');
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
      setErrorMessage('กรุณาระบุไซส์ เช่น 42 EU / 8.5 US');
      return;
    }
    if (!color.trim()) {
      setErrorMessage('กรุณาระบุสี เช่น Black / Volt');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProduct({
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

      const successMsg = 'เพิ่มสินค้าสำเร็จเรียบร้อย!';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('สำเร็จ', successMsg);
      }

      // Return to product list
      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || 'เพิ่มสินค้าไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isSubmitting}>
          <Text style={styles.backBtnText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>＋ Add New Boot</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Error Banner */}
          {errorMessage.length > 0 && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* SECTION: Image Upload & Preview */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>📸 Product Image</Text>
            <Text style={styles.sectionSub}>รองรับทั้งเลือกภาพจากเครื่อง หรือใส่ URL</Text>

            {/* Preview Box */}
            <View style={styles.imagePreviewContainer}>
              {imageUrl && !previewError ? (
                <View style={styles.previewWrapper}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.previewImage}
                    resizeMode="cover"
                    onError={() => setPreviewError(true)}
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUrl('')}>
                    <Text style={styles.removeImageText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderIcon}>⚽</Text>
                  <Text style={styles.placeholderText}>
                    {previewError ? 'ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบ URL' : 'ยังไม่ได้เลือกรูปภาพ (แสดง Placeholder)'}
                  </Text>
                </View>
              )}
            </View>

            {/* Image Buttons */}
            <View style={styles.imageActionRow}>
              <TouchableOpacity
                style={styles.chooseImageBtn}
                onPress={handleChooseImage}
                activeOpacity={0.8}>
                <Text style={styles.chooseImageText}>📁 Choose Image (จากเครื่อง)</Text>
              </TouchableOpacity>
            </View>

            {/* Image URL Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>หรือใส่ Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={(text) => {
                  setImageUrl(text);
                  setPreviewError(false);
                }}
                placeholder="https://example.com/boots.jpg"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* SECTION: Product Info */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>📝 Product Information</Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="เช่น Nike Mercurial Vapor 16 Elite"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Brand & Model Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Brand *</Text>
                <TextInput
                  style={styles.input}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Nike, Adidas, Puma..."
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Vapor 16, Predator..."
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Category Picker Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category / Stud Type *</Text>
              <View style={styles.chipContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}>
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.chipTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price & Stock Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price (฿) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="8900"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={stock}
                  onChangeText={setStock}
                  placeholder="10"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Color & Size Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Color *</Text>
                <TextInput
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                  placeholder="Volt / Black"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Size *</Text>
                <TextInput
                  style={styles.input}
                  value={size}
                  onChangeText={setSize}
                  placeholder="42 EU / 8.5 US"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="รายละเอียดคุณสมบัติรองเท้า เทคโนโลยี วัสดุอัปเปอร์..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}>
            {isSubmitting ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator size="small" color="#0F172A" />
                <Text style={styles.submitButtonText}>Saving Product...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>＋ Add Product</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
  },
  imagePreviewContainer: {
    height: 180,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  imageActionRow: {
    marginBottom: 12,
  },
  chooseImageBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  chooseImageText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
