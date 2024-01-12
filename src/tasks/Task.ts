import SchedulingPriority from '../SchedulingPriority'
import { PromiseWithResolvers } from '../utils/withResolvers'

type Task = PromiseWithResolvers & {
    priority: SchedulingPriority
}

export default Task
