# Automation Rules
- Always update `CHANGELOG.md` automatically when making changes to the codebase. Do not wait for the user to prompt you to do this.
- Always run a production build (`npm run build`) locally before committing and pushing code to GitHub to ensure we never break the live Vercel site.
- When building new UI components, always prioritize using our existing custom CSS classes (like the `glass` class) and our existing `surface` and `brand` color palettes to ensure a premium, unified aesthetic.
- Always use conventional commit messages (e.g., feat:, fix:, docs:, ui:) when committing code to GitHub so our project history remains clean and easy to read.
- Never write code that destructively deletes customer data without implementing a double-confirmation modal in the UI first.
- When rendering large lists of data (like the Gamified Leaderboards or Raw Data tables), always implement pagination or virtualized scrolling to prevent browser lag.
