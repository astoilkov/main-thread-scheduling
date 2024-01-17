// primary
export { default as yieldOrContinue } from './src/yieldOrContinue'

// secondary
export { default as yieldControl } from './src/yieldControl'
export { default as isTimeToYield } from './src/isTimeToYield'
export type { default as SchedulingStrategy } from './src/SchedulingStrategy'

// utility
export { default as queueTask } from './src/utils/queueTask'
export { default as withResolvers } from './src/utils/withResolvers'
export { default as afterFrame } from './src/utils/requestAfterFrame'
