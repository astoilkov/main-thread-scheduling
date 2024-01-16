import SchedulingPriority from '../SchedulingPriority'
import { PromiseWithResolvers } from '../utils/withResolvers'

type ScheduledTask = PromiseWithResolvers & {
    priority: SchedulingPriority
}

export default ScheduledTask
