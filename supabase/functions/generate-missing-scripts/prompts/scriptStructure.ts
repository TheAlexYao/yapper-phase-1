export const SCRIPT_STRUCTURE = {
  pattern: {
    line1: {
      speaker: 'character',
      type: 'Opening',
      description: 'Greeting + simple context',
      examples: [
        'Welcome! Would you like some coffee?',
        'Would you like some coffee?'
      ]
    },
    line2: {
      speaker: 'user',
      type: 'Initial Response',
      description: 'Simple affirmative response',
      examples: [
        'Yes, please',
        'I\'d like some coffee'
      ]
    },
    line3: {
      speaker: 'character',
      type: 'Key Question',
      description: 'Clear, focused question',
      examples: [
        'Hot or iced coffee?',
        'Hot coffee is 40 baht. Which one?'
      ]
    },
    line4: {
      speaker: 'user',
      type: 'Main Response',
      description: 'Direct answer',
      examples: [
        'Hot, please',
        'I\'ll have hot coffee'
      ]
    },
    line5: {
      speaker: 'character',
      type: 'Confirmation',
      description: 'Clear outcome',
      examples: [
        'That\'s 40 baht',
        'Your hot coffee will be ready soon'
      ]
    },
    line6: {
      speaker: 'user',
      type: 'Closing',
      description: 'Simple thanks/goodbye',
      examples: [
        'Thank you',
        'Thank you, see you later'
      ]
    }
  }
};