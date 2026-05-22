import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function UpgradeConfirmModal({ visible, plan, onCancel, onConfirm }) {
  if (!plan) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Premium</Text>
          <Text style={styles.title}>Esti gata sa incepi experienta Premium?</Text>
          <Text style={styles.description}>
            Ai ales planul {plan.name}. Deblochezi fara reclame, taskuri pe ore, durata estimata,
            programare automata si recalculare live pentru tranzit.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.86} style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryText}>Nu acum</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryText}>Da, continua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function PaymentPortalModal({ visible, plan, onCancel, onPay }) {
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');

  if (!plan) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Portal plata</Text>
          <Text style={styles.title}>{plan.price} {plan.cadence}</Text>
          <Text style={styles.description}>Introdu datele cardului pentru activarea mock a planului Premium.</Text>
          <View style={styles.form}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nume pe card"
              placeholderTextColor="rgba(199,196,215,0.55)"
              style={styles.input}
            />
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor="rgba(199,196,215,0.55)"
              style={styles.input}
            />
            <TextInput
              value={expiry}
              onChangeText={setExpiry}
              placeholder="MM/YY"
              placeholderTextColor="rgba(199,196,215,0.55)"
              style={styles.input}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.86} style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryText}>Inapoi</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={onPay}>
              <Text style={styles.primaryText}>Plateste</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    padding: 18
  },
  card: {
    width: '100%',
    maxWidth: 390,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.24)',
    backgroundColor: colors.surfaceRaised,
    padding: 20
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    marginBottom: 10
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginBottom: 18
  },
  form: {
    gap: 10,
    marginBottom: 18
  },
  input: {
    height: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '900'
  },
  primaryButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primary
  },
  primaryText: {
    color: colors.onPrimary,
    fontWeight: '900'
  }
});
