interface Event {
  id: string;
  text: string;
  effect: {
    type: 'water' | 'food' | 'health' | 'energy' | 'money';
    value: number;
  };
}

const events: Event[] = [
  {
    id: 'found_water',
    text: 'Вы нашли источник чистой воды! (+20 воды)',
    effect: { type: 'water', value: 20 }
  },
  {
    id: 'found_food',
    text: 'В заброшенном доме вы нашли консервы! (+15 еды)',
    effect: { type: 'food', value: 15 }
  },
  {
    id: 'injury',
    text: 'Вы поскользнулись и ушибли ногу (-10 здоровья)',
    effect: { type: 'health', value: -10 }
  },
  {
    id: 'merchant',
    text: 'Вы встретили торговца и купили припасы (-50 монет, +20 еды)',
    effect: { type: 'money', value: -50 }
  },
  {
    id: 'tired',
    text: 'Долгий путь утомил вас (-15 энергии)',
    effect: { type: 'energy', value: -15 }
  },
  {
    id: 'treasure',
    text: 'Вы нашли старый тайник! (+100 монет)',
    effect: { type: 'money', value: 100 }
  }
];

export const generateRandomEvent = (): Event => {
  const randomIndex = Math.floor(Math.random() * events.length);
  return events[randomIndex];
}; 