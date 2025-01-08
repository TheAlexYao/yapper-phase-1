export const SCRIPT_STRUCTURE = `
### 3. Script Structure for Language Learning

**Pattern** (6 lines):
\`\`\`
Line 1 (Character): Opening
- Greeting + simple context
- Example: "Welcome! Would you like some coffee?"
- OR just: "Would you like some coffee?"

Line 2 (User): Initial Response
- Can be phrase: "Yes, please"
- OR simple sentence: "I'd like some coffee"

Line 3 (Character): Key Question
- Clear, focused question
- Example: "Hot or iced coffee?"
- Can include price/option: "Hot coffee is 40 baht. Which one?"

Line 4 (User): Main Response
- Direct answer
- Can be phrase: "Hot, please"
- OR sentence: "I'll have hot coffee"

Line 5 (Character): Confirmation
- Clear outcome
- Price or next step
- Example: "That's 40 baht"
- OR: "Your hot coffee will be ready soon"

Line 6 (User): Closing
- Simple thanks/goodbye
- Example: "Thank you"
- OR: "Thank you, see you later"
\`\`\`

### 4. Beginner-Friendly
1. **Short, Clear Sentences**: Minimal grammar complexity.  
2. **Local/Cultural References**: If referencing food/items, use typical prices and add a short explanation if needed.  
3. **Price Format**: Show \`<AMOUNT> <CURRENCY>\` in \`targetText\`, then \`(about <USD> USD)\` in \`translation\` (if relevant).
`;