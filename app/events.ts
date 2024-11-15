interface Event {
  id: string;
  text: string;
  effect: {
    type: 'water' | 'food' | 'health' | 'energy' | 'money' | 'empty' | 'bullets' | 'enemy';
    value: number;
  };
}

export const events: Event[] = [
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
  const random = Math.floor(Math.random() * 100) + 1;
  const baseValue = Math.floor(Math.random() * 201) - 100;

  if (random <= 30) {
    const value = Math.floor(baseValue * 0.5);
    return {
      id: 'enemy',
      text: `Вы встретили врага! (${value} здоровья)`,
      effect: { type: 'money', value }
    };
  } else if (random <= 45) {
    const value = Math.floor(baseValue * 0.8);
    return {
      id: 'found_water',
      text: `Вы нашли источник чистой воды! (${value} воды)`,
      effect: { type: 'water', value }
    };
  } else if (random <= 60) {
    const value = Math.floor(baseValue * 0.6);
    return {
      id: 'found_food',
      text: `В заброшенном доме вы нашли консервы! (${value} еды)`,
      effect: { type: 'food', value }
    };
  } else if (random <= 70) {
    const value = Math.floor(baseValue * 0.3);
    return {
      id: 'injury',
      text: `Вы поскользнулись и ушибли ногу (${value} здоровья)`,
      effect: { type: 'health', value }
    };
  } else if (random <= 80) {
    const value = Math.floor(baseValue * 0.4);
    return {
      id: 'tired',
      text: `Долгий путь утомил вас (${value} энергии)`,
      effect: { type: 'energy', value }
    };
  } else if (random <= 90) {
    const value = Math.floor(baseValue * 1.2);
    return {
      id: 'merchant',
      text: `Вы встретили торговца и купили припасы (${value} монет)`,
      effect: { type: 'money', value }
    };
  } else {
    const value = Math.floor(baseValue * 2);
    return {
      id: 'treasure',
      text: `Вы нашли старый тайник! (${value} монет)`,
      effect: { type: 'money', value }
    };
  }
}; 