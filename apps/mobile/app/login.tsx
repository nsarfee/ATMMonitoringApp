import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';

const BOP_ORANGE = '#f26522';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [biometricState, setBiometricState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, []);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      router.replace('/(tabs)/dashboard');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials.\nUse admin / admin123');
    }
  };

  const handleBiometric = () => {
    setBiometricState('scanning');
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 500, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      ])
    );
    pulse.start();

    // Simulate biometric scan (1.8s)
    setTimeout(() => {
      pulse.stop();
      pulseAnim.setValue(1);
      setBiometricState('success');
      setTimeout(() => router.replace('/(tabs)/dashboard'), 700);
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

        {/* BOP Identity */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BOP</Text>
          </View>
          <Text style={styles.title}>ATM Monitor</Text>
          <Text style={styles.bankName}>THE BANK OF PUNJAB</Text>
          <Text style={styles.subtitle}>Operations Control System</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign in to continue</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#aaa"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In →</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometric Button */}
          <TouchableOpacity
            style={[
              styles.biometricBtn,
              biometricState === 'scanning' && styles.biometricScanning,
              biometricState === 'success' && styles.biometricSuccess,
            ]}
            onPress={handleBiometric}
            disabled={biometricState !== 'idle'}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.biometricIcon}>
                {biometricState === 'success' ? '✅' : '👆'}
              </Text>
            </Animated.View>
            <View>
              <Text style={[
                styles.biometricLabel,
                biometricState === 'scanning' && { color: BOP_ORANGE },
                biometricState === 'success' && { color: '#10b981' },
              ]}>
                {biometricState === 'idle' && 'Sign in with Fingerprint'}
                {biometricState === 'scanning' && 'Scanning fingerprint...'}
                {biometricState === 'success' && 'Authenticated!'}
              </Text>
              {biometricState === 'idle' && (
                <Text style={styles.biometricSub}>Touch sensor to verify identity</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.hint}>Demo: admin / admin123</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },

  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoBadge: {
    width: 68, height: 68, borderRadius: 18, backgroundColor: BOP_ORANGE,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: BOP_ORANGE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  logoBadgeText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#1d1d1f', marginBottom: 2 },
  bankName: { fontSize: 10, fontWeight: '900', color: BOP_ORANGE, letterSpacing: 3, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888' },

  form: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#e5e5ea',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#1d1d1f', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#e5e5ea', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
    color: '#1d1d1f', marginBottom: 16, backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: BOP_ORANGE, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e5ea' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#aaa', fontWeight: '600' },

  biometricBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#e5e5ea', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#fafafa',
  },
  biometricScanning: { borderColor: BOP_ORANGE, backgroundColor: '#fff8f5' },
  biometricSuccess: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  biometricIcon: { fontSize: 28 },
  biometricLabel: { fontSize: 14, fontWeight: '700', color: '#1d1d1f' },
  biometricSub: { fontSize: 11, color: '#aaa', marginTop: 1 },

  hint: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 16 },
});


