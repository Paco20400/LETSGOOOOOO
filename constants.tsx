
import React from 'react';

export const COLORS = {
  attraction: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  transport: 'bg-blue-100 text-blue-700 border-blue-200',
  hotel: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const CATEGORY_ICONS: Record<string, string> = {
  attraction: 'fa-camera-retro',
  food: 'fa-utensils',
  transport: 'fa-bus',
  hotel: 'fa-bed',
};

// 成員專屬色辨識 (根據索引循環使用)
export const MEMBER_PALETTE = [
  '#A8B58E', // 森林綠
  '#F3A97F', // 暖陽橘
  '#8D7B68', // 大地褐
  '#7FB3D5', // 湖泊藍
  '#C39BD3', // 薰衣草紫
  '#F1948A', // 珊瑚紅
];

export const TRAVEL_DATES = [
  { date: '2024-12-20', label: 'Day 1' },
  { date: '2024-12-21', label: 'Day 2' },
  { date: '2024-12-22', label: 'Day 3' },
  { date: '2024-12-23', label: 'Day 4' },
  { date: '2024-12-24', label: 'Day 5' },
];
