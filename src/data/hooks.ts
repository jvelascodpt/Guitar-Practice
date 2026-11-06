import { useLiveQuery } from 'dexie-react-hooks'
import * as repo from './repo'

export const useSettings = () => useLiveQuery(repo.getSettings)
export const useSessions = () => useLiveQuery(repo.listSessions)
export const useSongs = () => useLiveQuery(repo.listSongs)
export const usePlan = () => useLiveQuery(repo.listPlan)
export const useRecordings = () => useLiveQuery(repo.listRecordings)
