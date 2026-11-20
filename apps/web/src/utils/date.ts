const TIME_UNITS = [
  { label: "y", ms: 365 * 24 * 60 * 60 * 1000 },
  { label: "w", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "d", ms: 24 * 60 * 60 * 1000 },
  { label: "h", ms: 60 * 60 * 1000 },
  { label: "m", ms: 60 * 1000 },
] as const

export const getDateDistance = (date1: Date, date2: Date) => {
  const time1 = date1.getTime()
  const time2 = date2.getTime()

  if (!Number.isFinite(time1) || !Number.isFinite(time2)) {
    throw new RangeError("Invalid date provided")
  }

  const diff = Math.abs(time2 - time1)
  const unit = TIME_UNITS.find(({ ms }) => diff >= ms)

  if (!unit) return "1m"

  return `${Math.floor(diff / unit.ms)}${unit.label}`
}
