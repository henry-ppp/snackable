import { Animated as RNAnimated } from "react-native-web";

function stripDriver<T extends { useNativeDriver?: boolean }>(config: T): T {
  if (!config || typeof config !== "object") return config;
  return { ...config, useNativeDriver: false };
}

const timing = RNAnimated.timing.bind(RNAnimated);
const spring = RNAnimated.spring.bind(RNAnimated);
const decay = RNAnimated.decay.bind(RNAnimated);
RNAnimated.timing = ((value, config) => timing(value, stripDriver(config))) as typeof RNAnimated.timing;
RNAnimated.spring = ((value, config) => spring(value, stripDriver(config))) as typeof RNAnimated.spring;
RNAnimated.decay = ((value, config) => decay(value, stripDriver(config))) as typeof RNAnimated.decay;

export * from "react-native-web";

export const TurboModuleRegistry = {
  get() {
    return null;
  },
  getEnforcing() {
    return new Proxy(
      {},
      {
        get: () => () => undefined,
      },
    );
  },
};
