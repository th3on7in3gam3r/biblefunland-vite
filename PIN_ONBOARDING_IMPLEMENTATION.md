# PIN Onboarding Implementation

## Overview
Implemented a PIN onboarding flow that prompts parents to set a custom 4-digit PIN when they create their first child profile.

## Changes Made

### 1. New Component: `src/components/PinSetupModal.jsx`
- 3-step modal flow:
  1. Introduction explaining the purpose of the PIN
  2. Enter 4-digit PIN with numeric keypad
  3. Confirm PIN by re-entering
- Validates PIN match before saving
- Allows users to skip PIN setup (keeps default 4318)
- Includes shake animation for errors

### 2. Updated: `src/pages/Profile.jsx`
- Added PIN setup modal integration
- Modified `addChild()` function to check if:
  - This is the first child being created
  - Parent is using default PIN (4318)
- If both conditions are true, shows PIN setup modal before creating child
- Added `handlePinSetupComplete()` to save new PIN and create child
- Added `handlePinSetupSkip()` to create child with default PIN
- New state variables:
  - `showPinSetup`: Controls modal visibility
  - `pendingChildData`: Stores child data while PIN is being set up

### 3. Updated: `server/routes/parentalControls.js`
- Enhanced PUT endpoint to support PIN changes:
  - Validates current PIN before allowing updates
  - Accepts `new_pin` parameter for PIN changes
  - Properly handles `ai_toggles` as JSON
- Enhanced GET endpoint:
  - Parses `ai_toggles` JSON string
  - Returns default values if no controls exist

### 4. Updated: `src/components/ParentalControlsPanel.jsx`
- Added warning banner when using default PIN (4318)
- Encourages users to set a custom PIN for better security

## User Flow

### First Child Creation
1. Parent fills out child profile form (name, age, avatar)
2. Clicks "Add Child"
3. If this is their first child AND they have default PIN:
   - PIN setup modal appears
   - Parent can either:
     - Set up a custom 4-digit PIN (recommended)
     - Skip and use default PIN 4318
4. Child profile is created after PIN setup (or skip)

### Subsequent Children
- No PIN modal shown
- Child profiles are created immediately
- Parent can change PIN anytime in Parental Controls panel

## Security Features
- PIN must be exactly 4 digits
- PIN confirmation prevents typos
- Current PIN validation required for changes
- Default PIN warning in Parental Controls panel
- PIN protects:
  - Deleting child profiles
  - Changing parental control settings
  - Modifying AI feature toggles

## Default PIN
- Default PIN: `4318`
- Used when:
  - Parent skips PIN setup
  - No custom PIN has been set
- Can be changed anytime in Parental Controls panel

## Testing Checklist
- [ ] Create first child profile - PIN modal appears
- [ ] Set custom PIN - child profile created successfully
- [ ] Skip PIN setup - child profile created with default PIN
- [ ] Create second child - no PIN modal shown
- [ ] Change PIN in Parental Controls panel
- [ ] Delete child profile - requires PIN
- [ ] Default PIN warning shows when using 4318
- [ ] PIN mismatch shows error and clears confirm field
