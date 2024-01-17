import SchedulingStrategy from '../SchedulingStrategy'
import { PromiseWithResolvers } from '../utils/withResolvers'

type ScheduledTask = PromiseWithResolvers & {
    priority: SchedulingStrategy
}

export default ScheduledTask
