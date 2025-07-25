# Update Log

## [Unreleased]

### Fixed
- Made the `hasSufficientSAD` check in the frontend (`LoadingAScreen.tsx`) a true boolean by defaulting `sadBalance` to `0n` if it is null or undefined. This prevents subtle UI bugs and ensures the check is always reliable.
  - **Before:** `const hasSufficientSAD = sadBalance && sadBalance >= parseEther('1')`
  - **After:**  `const hasSufficientSAD = (sadBalance ?? 0n) >= parseEther('1')`
- Commit: `fix: make hasSufficientSAD a real boolean (default to 0n instead of short-circuiting on falsy balance)` 

## [0.1.0]

### Changed
- **Refactor DebugModal UI:** Always render the claim section when connected; drive button disabled state and label from a `hasClaimed` flag instead of token balance checks.  
- **Unified faucet and purchase flow:** Moved ETH‐faucet POST and Wagmi `purchaseSadness` call into a single click handler so MetaMask prompts immediately after funding.  
- **Enhanced status feedback:** Updated claim status messaging to note “It can take up to a minute” and added auto‑clear of status messages after 60 seconds.  
- **Fixed `tx.wait()` error:** Switched to displaying the returned transaction hash (hash‑only flow) to avoid `tx.wait is not a function` issues with Wagmi’s `useWriteContract`.  
- **Clarified server vs. client roles:** Confirmed that the API route only funds ETH and records claims; all on‑chain purchases are initiated in the browser via Wagmi/MetaMask.  
- **Documented MetaMask gas estimation behavior:** Added guidance on why MetaMask overestimates gas on Sepolia, how to estimate actual costs with `publicClient.estimateGas()`, and steps to manually cap gas fees in MetaMask’s advanced settings.  

## [0.1.1]

### Changed
- **Faucet backend (`/api/claim-faucet` route)**
  - Removed ETH‑funding logic; now sends 1 SAD token directly via ERC‑20 `transfer`.
  - Added logging for success (`[Faucet] Sent 1 SAD to <address>, Tx: <txHash>`) and error cases.
  - Updated response schema to return `{ success: true, tokenTxHash }` on success.
- **Debug UI (`DebugModal.tsx`)**
  - Removed ETH request & MetaMask auto‑purchase flow.
  - Simplified claim button to POST to the faucet and display status: “⏳ Sending 1 SAD…” → “✅ 1 SAD sent! Tx: …”.
  - Cleaned up unused state, imports and status messages to reflect direct token transfer.
