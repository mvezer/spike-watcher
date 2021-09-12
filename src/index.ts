import * as fs from 'fs'
import * as os from 'os'
import OHLCVrepository from './repositories/ohlcvRepository'
// import { percentDifference } from './utils/mathUtils'

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
            resolve(ohlcvRepository)
        })

        stream.on('end', reject)
    })
}

loadOHLCV('data/Binance_BTCUSDT_minute.csv')
    .then((data: OHLCVrepository) => {
        console.log('records read:', data.size)
        console.log('latest:', JSON.stringify(data.last, null, 4))
        console.log('oldest:', JSON.stringify(data.first, null, 4))
    })
    .catch(console.error)
 
console.log('Hello there')