import SchedulingStrategy from './SchedulingStrategy'
import { PromiseWithResolvers } from './utils/withResolvers'

type ScheduledTask = PromiseWithResolvers & {
    strategy: SchedulingStrategy
}

export default ScheduledTask
