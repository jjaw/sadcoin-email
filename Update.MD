# Update Log

## [Unreleased]

### Fixed
- Made the `hasSufficientSAD` check in the frontend (`LoadingAScreen.tsx`) a true boolean by defaulting `sadBalance` to `0n` if it is null or undefined. This prevents subtle UI bugs and ensures the check is always reliable.
  - **Before:** `const hasSufficientSAD = sadBalance && sadBalance >= parseEther('1')`
  - **After:**  `const hasSufficientSAD = (sadBalance ?? 0n) >= parseEther('1')`
- Commit: `fix: make hasSufficientSAD a real boolean (default to 0n instead of short-circuiting on falsy balance)` 