import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function ConfirmDeleteModal({ visible, taskTitle, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Confirmare</Text>
          <Text style={styles.title}>Esti sigur?</Text>
          <Text style={styles.message}>
            Taskul {taskTitle ? `"${taskTitle}"` : 'selectat'} va fi sters din lista.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.86} style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Anuleaza</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.86} style={styles.deleteButton} onPress={onConfirm}>
              <Text style={styles.deleteText}>Sterge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4,8,18,0.72)',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surfaceRaised,
    padding: 20,
    gap: 10
  },
  eyebrow: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900'
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10
  },
  cancelButton: {
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    minHeight: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  deleteText: {
    color: '#301210',
    fontSize: 13,
    fontWeight: '900'
  }
});
