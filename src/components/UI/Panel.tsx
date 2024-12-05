import React, { useEffect, useState, useRef } from 'react';
import { WeaponType } from '../../types/weapons';
import styles from './Panel.module.css';
import Image from 'next/image';
import DamageNotification from './DamageNotification';

interface PanelProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  playerHealth: number;
  maxHealth: number;
  abilities: WeaponInfo;
}

interface AbilityButton {
  key: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

interface WeaponInfo {
  [key: string]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

interface DamageNotificationData {
  id: number;
  damage: number;
  timestamp: number;
}

/**
 * RoundedSquareProgress Component
 * Renders a sweeping cooldown animation around a rounded square.
 */
const RoundedSquareProgress: React.FC<{
  size: number;
  strokeWidth: number;
  percentage: number; // 0 to 100
  borderRadius: number;
}> = ({ size, strokeWidth, percentage, borderRadius }) => {
  const halfStroke = strokeWidth / 2;
  const adjustedSize = size - strokeWidth;
  const perimeter = 4 * adjustedSize; // Approximate perimeter for a rounded square
  const dashOffset = perimeter - (perimeter * percentage) / 100;

  return (
    <svg
      width={size}
      height={size}
      className={styles.roundedSquareProgress}
    >
      {/* Foreground Rect for Sweeping Animation */}
      <rect
        x={halfStroke}
        y={halfStroke}
        width={adjustedSize}
        height={adjustedSize}
        rx={borderRadius}
        ry={borderRadius}
        stroke="#39ff14"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={perimeter}
        strokeDashoffset={dashOffset}
        className={styles.progressForeground}
      />
    </svg>
  );
};

export default function Panel({ currentWeapon, onWeaponSelect, playerHealth, maxHealth, abilities }: PanelProps) {
  const [damageNotifications, setDamageNotifications] = useState<DamageNotificationData[]>([]);
  const nextNotificationId = useRef(0);
  const prevHealth = useRef(playerHealth);

  useEffect(() => {
    if (playerHealth < prevHealth.current) {
      const damage = prevHealth.current - playerHealth;
      setDamageNotifications(prev => [
        ...prev,
        { 
          id: nextNotificationId.current++, 
          damage,
          timestamp: Date.now()
        }
      ].slice(-3)); // Keep only the last 3 notifications
    }
    
    prevHealth.current = playerHealth;
  }, [playerHealth]);

  const handleNotificationComplete = (id: number) => {
    setDamageNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={styles.bottomPanel}>
      {/* Health Bar Section */}
      <div className={styles.healthBarSection}>
        {damageNotifications.map((notification, index) => (
          <DamageNotification
            key={notification.id}
            damage={notification.damage}
            index={index}
            timestamp={notification.timestamp}
            onComplete={() => handleNotificationComplete(notification.id)}
          />
        ))}
        <div className={styles.healthBarContainer}>
          <div className={styles.healthBarDecoration}>
            <div className={styles.healthBarOrnamentLeft} />
            <div className={styles.healthBarOrnamentRight} />
          </div>
          <div className={styles.healthBar}>
            <div className={styles.healthBarBackground} />
            <div 
              className={styles.healthBarInner} 
              style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
            />
            <div className={styles.healthBarShine} />
            <div className={styles.healthBarPulse} />
          </div>
          <span className={styles.healthText}>
            <span className={styles.healthCurrent}>{playerHealth}</span>
            <span className={styles.healthSeparator}>/</span>
            <span className={styles.healthMax}>{maxHealth}</span>
          </span>
        </div>
      </div>

      {/* Abilities Section */}
      <div className={styles.abilityContainer}>
        {abilities[currentWeapon] && (
          <>
            <div className={styles.ability}>
              <div className={styles.keyBind}>Q</div>
              <Image 
                src={abilities[currentWeapon].q.icon} 
                alt="Q ability" 
                width={50}
                height={50}
                className={styles.abilityIcon}
              />
              {abilities[currentWeapon].q.currentCooldown > 0 && (
                <div className={styles.cooldownOverlay}>
                  <RoundedSquareProgress
                    size={50}
                    strokeWidth={4}
                    percentage={(abilities[currentWeapon].q.currentCooldown / abilities[currentWeapon].q.cooldown) * 100}
                    borderRadius={8}
                  />
                  <span className={styles.cooldownText}>
                    {Math.ceil(abilities[currentWeapon].q.currentCooldown)}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.ability}>
              <div className={styles.keyBind}>E</div>
              <Image 
                src={abilities[currentWeapon].e.icon} 
                alt="E ability" 
                width={50}
                height={50}
                className={styles.abilityIcon}
              />
              {abilities[currentWeapon].e.currentCooldown > 0 && (
                <div className={styles.cooldownOverlay}>
                  <RoundedSquareProgress
                    size={50}
                    strokeWidth={4}
                    percentage={(abilities[currentWeapon].e.currentCooldown / abilities[currentWeapon].e.cooldown) * 100}
                    borderRadius={8}
                  />
                  <span className={styles.cooldownText}>
                    {Math.ceil(abilities[currentWeapon].e.currentCooldown)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Weapons Section */}
      <div className={styles.weaponIcons}>
        {Object.values(WeaponType)
          .filter((_, index) => index < 3)
          .map((weapon, index) => (
            <div 
              key={weapon}
              className={`${styles.weaponSlot} ${currentWeapon === weapon ? styles.activeWeapon : ''}`}
              onClick={() => onWeaponSelect(weapon)}
            >
              <div className={styles.keyBind}>{index + 1}</div>
              <Image 
                src={`/icons/${index + 1}.svg`} 
                alt={weapon} 
                width={50} 
                height={50} 
                className={styles.weaponIcon}
              />
            </div>
          ))}
      </div>
    </div>
  );
}