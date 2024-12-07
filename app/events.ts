import { Enemy } from './types';

interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  quantity: number;
}

interface Event {
  id: string;
  text: string;
  effect: {
    type: 'fuel' | 'parts' | 'health' | 'energy' | 'money' | 'empty' | 'bullets' | 'enemy' | 'item';
    value: number | InventoryItem;
  };
}

export const events: Event[] = [
  {
    id: 'found_fuel',
    text: 'Вы обнаружили заброшенную заправочную станцию! (+20 топлива)',
    effect: { type: 'fuel', value: 20 }
  },
  {
    id: 'found_parts',
    text: 'В поясе астероидов вы нашли редкие металлы! (+15 запчастей)',
    effect: { type: 'parts', value: 15 }
  },
  {
    id: 'injury',
    text: 'Микрометеоритный дождь повредил обшивку корабля (-10 здоровья)',
    effect: { type: 'health', value: -10 }
  },
  {
    id: 'merchant',
    text: 'На орбитальной станции вы встретили контрабандиста (-50 монет, +20 запчастей)',
    effect: { type: 'money', value: -50 }
  },
  {
    id: 'tired',
    text: 'Перегрузка двигателей истощила энергощиты (-15 энергии)',
    effect: { type: 'energy', value: -15 }
  },
  {
    id: 'treasure',
    text: 'Вы обнаружили тайник космических пиратов! (+100 монет)',
    effect: { type: 'money', value: 100 }
  },
  {
    id: 'black_hole',
    text: 'Гравитационное поле черной дыры повредило системы корабля (-30 энергии)',
    effect: { type: 'energy', value: -30 }
  },
  {
    id: 'space_station',
    text: 'Вы состыковались с дружественной космической станцией (+25 топлива, +10 запчастей)',
    effect: { type: 'fuel', value: 25 }
  },
  {
    id: 'alien_tech',
    text: 'Обнаружены обломки инопланетного корабля! (+40 запчастей)',
    effect: { type: 'parts', value: 40 }
  },
  {
    id: 'nebula',
    text: 'Прохождение через туманность повредило системы навигации (-20 энергии)',
    effect: { type: 'energy', value: -20 }
  },
  {
    id: 'found_nanobandage',
    text: 'В медицинском отсеке заброшенной станции вы нашли нанобинты!',
    effect: { type: 'item', value: { id: 1, name: 'Нанобинты', icon: '🩹', quantity: 1 } }
  },
  {
    id: 'found_energy_cell',
    text: 'В обломках грузового корабля обнаружена заряженная энергоячейка!',
    effect: { type: 'item', value: { id: 2, name: 'Энергоячейка', icon: '🔋', quantity: 1 } }
  },
  {
    id: 'found_repair_kit',
    text: 'На орбитальной станции вы нашли инженерный ремкомплект!',
    effect: { type: 'item', value: { id: 3, name: 'Ремкомплект', icon: '🔧', quantity: 1 } }
  },
  {
    id: 'found_fuel_cell',
    text: 'В заброшенном космическом доке обнаружен топливный картридж!',
    effect: { type: 'item', value: { id: 4, name: 'Топливный картридж', icon: '⛽', quantity: 1 } }
  }
];

export const generateRandomEvent = (startCombat: (enemy: Enemy) => void): Event => {
  const random = Math.floor(Math.random() * 100) + 1;
  const baseValue = Math.floor(Math.random() * 201) - 100;

  if (random <= 20) {
    const enemy: Enemy = {
      name: 'Космический Пират',
      health: 100,
      maxHealth: 100,
      damage: 20,
      icon: '👾'
    };
    startCombat(enemy);
    return {
      id: 'combat',
      text: 'Вы столкнулись с космическим пиратом!',
      effect: { type: 'empty', value: 0 }
    };
  } else if (random <= 35) {
    const value = Math.floor(baseValue * 0.8);
    return {
      id: 'found_fuel',
      text: `Вы обнаружили топливный танкер! (${value} топлива)`,
      effect: { type: 'fuel', value }
    };
  } else if (random <= 50) {
    const value = Math.floor(baseValue * 0.6);
    return {
      id: 'found_parts',
      text: `В поясе астероидов вы нашли ценные металлы! (${value} запчастей)`,
      effect: { type: 'parts', value }
    };
  } else if (random <= 65) {
    const value = Math.floor(baseValue * 0.3);
    return {
      id: 'black_hole',
      text: `Гравитационное поле черной дыры повредило системы корабля (${value} энергии)`,
      effect: { type: 'energy', value }
    };
  } else if (random <= 75) {
    const value = Math.floor(baseValue * 0.4);
    return {
      id: 'nebula',
      text: `Прохождение через туманность повредило системы навигации (${value} энергии)`,
      effect: { type: 'energy', value }
    };
  } else if (random <= 85) {
    const value = Math.floor(baseValue * 1.2);
    return {
      id: 'space_station',
      text: `Вы состыковались с дружественной космической станцией (${value} топлива)`,
      effect: { type: 'fuel', value }
    };
  } else {
    const value = Math.floor(baseValue * 2);
    return {
      id: 'alien_tech',
      text: `Обнаружены обломки инопланетного корабля! (${value} запчастей)`,
      effect: { type: 'parts', value }
    };
  }
}; 