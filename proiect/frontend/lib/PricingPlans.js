import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function PricingPlans({ pricing, onSelectPlan }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{pricing.title}</Text>
      <View style={styles.plans}>
        {pricing.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelectPlan={onSelectPlan} />
        ))}
      </View>
      <Text style={styles.footer}>{pricing.footer}</Text>
    </View>
  );
}

function PlanCard({ plan, onSelectPlan }) {
  return (
    <View style={[styles.plan, plan.selected && styles.selectedPlan]}>
      {plan.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{plan.badge}</Text>
        </View>
      ) : null}
      <View style={styles.planHeader}>
        <View style={styles.planNameBox}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.cadence}>{plan.cadence}</Text>
        </View>
      </View>
      <View style={styles.features}>
        {plan.features.map((feature) => (
          <Text key={feature} style={styles.feature}>✓ {feature}</Text>
        ))}
      </View>
      <TouchableOpacity
        activeOpacity={0.86}
        style={[styles.button, plan.selected && styles.primaryButton]}
        onPress={() => onSelectPlan?.(plan)}
      >
        <Text style={[styles.buttonText, plan.selected && styles.primaryButtonText]}>{plan.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    marginTop: 12
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center'
  },
  plans: {
    gap: 16
  },
  plan: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 18
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(192,193,255,0.05)'
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: radii.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 14
  },
  planNameBox: {
    flex: 1
  },
  planName: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900'
  },
  planSubtitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  },
  priceBox: {
    alignItems: 'flex-end',
    paddingTop: 1
  },
  price: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900'
  },
  cadence: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500'
  },
  features: {
    gap: 10,
    marginBottom: 18
  },
  feature: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  },
  button: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.secondaryContainer
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  buttonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  primaryButtonText: {
    color: colors.onPrimary
  },
  footer: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 6
  }
});
