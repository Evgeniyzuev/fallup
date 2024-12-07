import React from 'react';
import { Enemy } from '../types';

interface CombatScreenProps {
  enemy: Enemy;
  playerHealth: number;
  playerMaxHealth: number;
  playerBullets: number;
  onAttack: () => void;
  onHeal: () => void;
  onRetreat: () => void;
  combatLog: string[];
  playerTurn: boolean;
}

export function CombatScreen({
  enemy,
  playerHealth,
  playerMaxHealth,
  playerBullets,
  onAttack,
  onHeal,
  onRetreat,
  combatLog,
  playerTurn
}: CombatScreenProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      color: 'white',
      zIndex: 1000,
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px' 
      }}>
        {/* Статус игрока */}
        <div>
          <div>Здоровье: {playerHealth}/{playerMaxHealth} ❤️</div>
          <div>Патроны: {playerBullets} 🔫</div>
        </div>
        
        {/* Статус противника */}
        <div>
          <div>{enemy.icon} {enemy.name}</div>
          <div>Здоровье: {enemy.health}/{enemy.maxHealth} ❤️</div>
        </div>
      </div>

      {/* Лог боя */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
      }}>
        {combatLog.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
      </div>

      {/* Кнопки действий */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
      }}>
        <button
          onClick={onAttack}
          disabled={!playerTurn || playerBullets <= 0}
          style={{
            padding: '10px 20px',
            backgroundColor: playerTurn ? '#4CAF50' : '#666',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: playerTurn ? 'pointer' : 'not-allowed',
          }}
        >
          Атаковать 🔫
        </button>
        <button
          onClick={onHeal}
          disabled={!playerTurn}
          style={{
            padding: '10px 20px',
            backgroundColor: playerTurn ? '#2196F3' : '#666',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: playerTurn ? 'pointer' : 'not-allowed',
          }}
        >
          Лечиться 🩹
        </button>
        <button
          onClick={onRetreat}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Отступить ↩️
        </button>
      </div>
    </div>
  );
} 