# Flakey mobile

The iOS and Android app for [Flakey](https://flakey.app), built with Expo SDK 58 and Expo Router.

It connects to the same Supabase project as the web app (built in Lovable), so you sign in with the same email and see the same people and key dates. All data access goes through the existing tables and row-level security. The app makes no backend changes.

## What's in v1

- **Sign in** with an email link that opens the app, or the 6-digit code from the same email (see "Sign-in setup").
- **Today:** key dates in the next 30 days.
- **People:** search your circle, open a profile, and add, edit or remove people. Adding someone creates the same automatic key dates as the web wizard: birthday, Mother's or Father's Day, Valentine's Day, Sibling Day and Christmas, depending on the relationship.
- **Dates:** the year ahead grouped by month. Add, edit or delete key dates, either yearly or one-off.
- **Settings:** push reminders on or off, and sign out.
- **Push reminders:** this phone's push token is saved to `device_tokens`. Tapping a reminder opens that key date.

The app is deliberately focused on remembering birthdays and important dates. Gifts, moments, nudges, the concierge and shared lists are left out on purpose.

## Run it

```bash
cp .env.example .env     # public Supabase URL and publishable key
npm install
npx expo start
```

Everything runs in Expo Go, including reminders. For a build that matches the store version, make a development build:

```bash
npx eas-cli@latest build --profile development --platform ios
```

Before running `eas build` for the first time, run `npx eas-cli@latest init`. It links the project and adds `extra.eas.projectId` to `app.json`.

Checks: `npm run typecheck`, `npx expo lint` and `npm test`. All three run on every push to GitHub (`.github/workflows/ci.yml`).

## Ship to TestFlight

You need an Expo account and an Apple Developer account. From the repo root on your own computer:

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest init                 # first time only: links the project to Expo
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

The first run asks you to sign in to Apple. EAS then creates the signing certificate, the provisioning profile and the App Store Connect app record (`app.flakey.ios`). It builds in the cloud, uploads to App Store Connect and increments the build number on each build. The build reaches TestFlight after Apple finishes processing, usually 10 to 30 minutes. `eas.json` holds the `development`, `preview` and `production` profiles.

## Sign-in setup (one-time, in Supabase)

The email link sends people back to the app at `flakey://auth/callback`. Supabase only redirects to allow-listed URLs, so add these under **Authentication > URL Configuration > Redirect URLs**:

- `flakey://auth/callback` (development and store builds)
- `exp://**` (only needed for testing in Expo Go)

**6-digit code:** the app also accepts the code from the sign-in email, which is handy when the email is opened on a different device. The web app's magic-link template (`supabase/functions/_shared/email-templates/magic-link.tsx`) receives `token` but doesn't display it yet. Add it to the template to turn this on.

## Reminders

Reminders are scheduled **on the phone**, at 9am local time 30, 10, 3 and 1 days before each key date, and on the day. They work offline and need no server setup: once notifications are allowed, the app plans the soonest 60 reminders. It re-plans whenever a date changes or the app comes to the foreground; iOS allows at most 64 pending per app. Dates added on flakey.app are picked up the next time the app opens. The planning lives in `src/lib/reminderPlan.ts` and is unit tested.

**Server push is off** (`REMOTE_PUSH_ENABLED = false` in `src/lib/push.ts`), so nobody gets each reminder twice. The backend still supports it: `send-event-reminders` runs daily at 09:00 UTC and sends via `send-push-notification`, to APNs for iOS and to FCM for Android. To switch to server push, set the flag to `true` and stop scheduling local reminders. Then configure:

- **iOS:** the Supabase secrets `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY`, `APNS_BUNDLE_ID=app.flakey.ios`, and `APNS_ENVIRONMENT` (`sandbox` for development builds, `production` for TestFlight and the App Store).
- **Android:** a Firebase app for `app.flakey.android`, its `google-services.json` referenced from `android.googleServicesFile` in `app.json`, and the Supabase secret `FCM_SERVICE_ACCOUNT_JSON`.

Email and WhatsApp reminders from the server are unaffected either way.

## Project layout

```
src/app/                 Expo Router routes
  _layout.tsx            fonts, providers, auth-gated stacks (Stack.Protected)
  sign-in.tsx, auth/callback.tsx
  (app)/(tabs)/          Today, People, Dates, Settings (NativeTabs)
  (app)/person/          [id] profile, new, edit
  (app)/date/edit.tsx    add or edit a key date (?id= or ?personId=)
src/features/data.ts     TanStack Query hooks over Supabase
src/lib/                 supabase client, push, date and people helpers, generated DB types
src/ui/                  Paper & Ink components (Text, Button, Card, Field, DateField, etc.)
```

`src/lib/database.types.ts` is copied from the web app (`src/integrations/supabase/types.ts`). Re-copy it when the schema changes. `src/lib/autoDates.ts` and `src/lib/dates.ts` mirror web logic and say which files they follow.
