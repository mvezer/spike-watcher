import OHLCVrepository from "../repositories/ohlcvRepository"
import { percentDifference } from "./mathUtils"

export type Interval = {
    from: number
    to: number
}

export type SimulationResult = {
    runTime: number
    maxPotentialUplift: number
    maxPotentialDrop: number
}

export const findSpikes = (data: OHLCVrepository, maxCandleCount: number, minPercentChange: number, start = 0, end = data.size - 1): Interval[] => {
    if (end < start) {
        throw new Error(`End index (${end}) cannot be smaller that start index (${start})`)
    }
    const intervals: Interval[] = []
    let from: number
    let to: number = start

    while (to <= end) {
        from = Math.max(to - maxCandleCount + 1, start)
        const currInterval:Interval = { from, to } as Interval
        if (maxPercentDifference(data, currInterval) >= minPercentChange) {
            intervals.push(currInterval)
        }
        to++
    }

    // remove trailing spikesb
    const filteredIntervals: Interval[] = []
    for (let j = (intervals.length - 1); j > 0; j--) {
        if ((intervals[j].to - intervals[j - 1].to) > 1) {
            filteredIntervals.push(intervals[j])
        }
    }
    return filteredIntervals.reverse()
}

export const maxPercentDifference = (data: OHLCVrepository, interval: Interval): number => {
    let prevPercentDiff: number = 0
    let currPercentDiff: number | null = null
    let i: number = interval.to
    do {
        if (currPercentDiff !== null) {
            prevPercentDiff = currPercentDiff
        }
        currPercentDiff = percentDifference(data.getByIndex(i).open, data.getByIndex(interval.to).close)
        i--
    } while (i >= interval.from && currPercentDiff > prevPercentDiff)

    return currPercentDiff
}

export const simulate = (data: OHLCVrepository, spike: Interval, stopLossPercent: number): SimulationResult => {
    let i = spike.to + 1
    let buyPrice = data.getByIndex(spike.to).close
    let maxPotentialUplift: number = 0
    while (i < data.size && percentDifference(buyPrice, data.getByIndex(i).low) > (stopLossPercent * -1)) {
        const currentMax = percentDifference(buyPrice, data.getByIndex(i).high)
        if (currentMax > maxPotentialUplift) {
            maxPotentialUplift = currentMax
        }
        i++
    }
    i --

    return {
        runTime: i - spike.to,
        maxPotentialUplift,
        maxPotentialDrop: percentDifference(buyPrice, data.getByIndex(i).low)
    } as SimulationResult
}