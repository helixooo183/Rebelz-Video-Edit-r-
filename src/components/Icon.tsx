import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

export type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Tek ikon ailesi: Material Icons. iOS ve Android'de aynı görsel dil.
 * İkon yalnızca destekleyici; her ikon düğmesinin erişilebilirlik etiketi var.
 */
export function Icon({ name, size = 22, color, style }: Props) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
