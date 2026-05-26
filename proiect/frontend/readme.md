# FocusFlow Mobile Frontend

Expo-based React Native client for the Smart Time Management Platform.

## What it covers

- Authentication with register, login, JWT persistence, and logout
- Calendar events with recurrence, alarms, completion, and failure states
- Day tasks with create, update, completion, and failure actions
- Wake-up schedule, manual overrides, notifications, and event alarms
- Quick notes stored in `calendar.quicknotes`
- Focus sessions and timer-driven persistence in `calendar.focussessions`
- Commute suggestions and premium recalculation
- Free-time preferences and server-side free-slot detection
- Premium task auto-arrangement
- Backend analytics summary and leaderboard
- Billing, premium validation, checkout-session launch, and cancellation
- Advertising eligibility, ad retrieval, impression, and click reporting

## Setup

1. Create a local env file in this folder:

```bash
copy .env.example .env
```

2. Set `EXPO_PUBLIC_API_BASE_URL`.

Recommended local value when using the nginx proxy:

```text
EXPO_PUBLIC_API_BASE_URL=http://focusflow.local/api
```

If you test on a physical device, replace that host with one reachable from the phone.

3. Install dependencies:

```bash
npm install
```

4. Run the app:

```bash
npm run web
```

You can also use `npm run android` or `npm run ios` in a machine that has the required Expo tooling available.
