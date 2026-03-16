declare module '@fortawesome/fontawesome-svg-core' {
  export interface IconDefinition {
    prefix: string;
    iconName: string;
    icon: [number, number, string[], string, string | string[]];
  }
  export type IconProp = IconDefinition | string | string[];
  export const library: {
    add: (...icons: IconDefinition[]) => void;
    reset: () => void;
  };
}
