🎯 **What:**
Added unit tests for the `RightSystemPanel` component to address a gap in testing coverage for the system panel UI.

📊 **Coverage:**
The new test file (`src/__tests__/RightSystemPanel.test.tsx`) covers the following scenarios:
- **Valid Data Rendering**: Confirms that when `status` is populated with typical mock data, the corresponding system info metrics (RAM, CPU, GPU), document summary data, and model status render successfully and show up on the UI.
- **Null Fallback Handling**: Checks that passing `status={null}` gracefully falls back to default values (0 values, placeholder texts) without breaking the rendering logic.
- **Conditional Flags Variations**: Specifically tests conditional rendering outputs, e.g. text changing when `offline_secure` is false vs true.

✨ **Result:**
The `RightSystemPanel` component logic is now reliably covered by unit tests, establishing a safety net against regressions if any metrics logic or props parsing needs to be updated. Also fixed some linter issues regarding unused test imports.
