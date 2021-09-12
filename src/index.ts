import * as fs from 'fs'
import moment from 'moment'
import * as os from 'os'
import OHLCVrepository from './repositories/ohlcvRepository'
import { findSpikes, Interval, maxPercentDifference, simulate, SimulationResult } from './utils/analyticsUtils'
import { DATE_TIME_FORMAT, formatDateTime } from './utils/dateTimeUtils'
import { formatPercent } from './utils/mathUtils'

// const DATA_DIR = 'data'

const loadOHLCV = (fileName: string): Promise<OHLCVrepository> => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(fileName, 'utf-8')
        const ohlcvRepository: OHLCVrepository = new OHLCVrepository()
    
        let isFirstChunk: boolean = true
        let carryLineFragment:string | null = null
        stream.on('data', (chunk) => {
            const buffer: string = carryLineFragment ? carryLineFragment.concat(chunk.toString()) : chunk.toString()
            const lines: string[] = buffer.split(os.EOL)
            for (let i:number = isFirstChunk ? 2 : 0; i < lines.length - 1; i++) {
                ohlcvRepository.addItemFromCSV(lines[i])
            }
            isFirstChunk = false
            carryLineFragment = lines[lines.length - 1]
        })

        stream.on('end', () => {
            if (carryLineFragment) {
                ohlcvRepository.addItemFromCSV(carryLineFragment)
            }

            console.log(`Loading done, ${ohlcvRepository.size} candles loaded, time range: ${formatDateTime(ohlcvRepository.first?.timestamp || moment())} - ${formatDateTime(ohlcvRepository.last?.timestamp || moment())}`)
            resolve(ohlcvRepository)
        })

        stream.on('end', reject)
    })
}

console.log(`Loading...`)


loadOHLCV('data/Binance_BTCUSDT_minute.csv')
    .then((data: OHLCVrepository) => {
        console.log('records read:', data.size)
        console.log('latest:', JSON.stringify(data.last, null, 4))
        console.log('oldest:', JSON.stringify(data.first, null, 4))

        console.log('Searching spikes...')

        const startIndex: number = data.timeStampToIndex(moment('10-09-2021 01:00:00', DATE_TIME_FORMAT))
        const spikes: Interval[] = findSpikes(data, 5, 0.01, startIndex )
        console.log(`Found ${spikes.length} spikes`)
        spikes.forEach((spike:Interval) => {
            const res: SimulationResult = simulate(data, spike, 0.01)
            console.log(`Buying at ${formatDateTime(data.getByIndex(spike.to).timestamp)}`)
            console.log(`    spike: ${formatPercent(maxPercentDifference(data, spike))}`)
            console.log(`    runtime: ${res.runTime} min(s)`)
            console.log(`    max potential uplift: ${formatPercent(res.maxPotentialUplift, true)}`)
            console.log(`    max potential drop: ${formatPercent(res.maxPotentialDrop, true)}`)
            // const buyPrice:number = data.getByIndex(spike.to).close
            // for (let i:number = spike.to + 1; i < spike.to + res.runTime; i++) {
            //     console.log(`       hi: ${formatPercent(percentDifference(buyPrice, data.getByIndex(i).high), true)} |    lo: ${formatPercent(percentDifference(buyPrice, data.getByIndex(i).low), true)}`)
            // }
        })

    })
    .catch(console.error)
 