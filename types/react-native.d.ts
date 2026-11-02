declare module "react-native-web" {
  export const View: any;
  export const Text: any;
  export const Pressable: any;
  export const Animated: any;
  export const PanResponder: any;
  export const Image: any;
  export const TextInput: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const unstable_createElement: any;
}

declare module "react-native" {
  export const View: any;
  export const Text: any;
  export const Pressable: any;
  export const Animated: any;
  export const PanResponder: any;
  export const Image: any;
  export const TextInput: any;
  export const StyleSheet: any;
  export type ViewStyle = any;
  export type StyleProp<T> = T;
  export type PressableProps = any;
  export type TextInputProps = any;
  export type ImageSourcePropType = any;
}
