## 2026-05-26 - Prevent UI thrashing from background system polling
**Learning:** React Router's <Routes> doesn't prevent child re-renders. A 5s polling interval at the root App level will cascade and re-render the entire app (including expensive document array reductions) unless children are properly memoized.
**Action:** Always memoize heavy route components and navigation sidebars when the root component has a polling mechanism.
