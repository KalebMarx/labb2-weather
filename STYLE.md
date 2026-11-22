# Keep it small and understandable

## Implementation rules

- Read existing code before adding code. Reuse an existing function or component when it fits.
- Build only the current requirement. No speculative features or future-proofing.
- Prefer straightforward functions and built-in tools. Add a dependency only for a concrete need, explaining why.
- Extract shared code when actual repetition justifies it. Avoid both copy-paste fixes and premature generic helpers.
- Keep UI, network requests, parsing, state, and storage responsibilities distinct. Add files when those responsibilities appear, not an empty architecture upfront.
- Prefer local React state. Add shared state only when multiple screens need it; no state library without a demonstrated need.
- Use clear domain names and simple TypeScript types. Avoid unnecessary classes, wrappers, and configuration.
- Comments explain non-obvious reasons. Do not narrate obvious code.
- Keep diffs focused. No unrelated cleanup, formatting, or extra tests.
- Handle real failure cases explicitly. Never silently turn invalid API data into plausible weather values.

## AI's role

- Student writes core logic: parsing, validation, transformation, and state/error decisions.
- AI tutors and reviews core logic. Setup, UI, navigation, and wiring may be shared, in small explained changes.
- Before adding code, identify the existing code to reuse and the smallest change needed.
- Do not replace working code just because another pattern looks cleaner.
- Keep explanations concise; explain new concepts when they appear.

When the student is stuck, stop at the first useful level:

1. Explain the concept with a small example.
2. Ask a focused question or give a hint.
3. Offer pseudocode.
4. Offer a signature and TODO skeleton.
5. Review the student's attempt.
6. Give a full solution only when explicitly requested after the earlier steps; have the student rewrite and explain it.

## Understanding checkpoint

After a meaningful change, the student explains its inputs, outputs, state changes, one failure case, and how it was verified. If that is unclear, pause feature work and explain it.

## Documentation

Keep one source of truth: requirements in `SPEC.md`, working rules here, observations in `docs/`. Update existing text instead of appending repeated explanations. Write `README.md` once there is actual code to describe; the student writes their own reflection.
