import moment from "moment";

export type OHLCVconfig = {
    symbol: string,
    timestamp: moment.Moment
    open: number
    high: number
    low: number
    close: number
    baseVolume: number
    quoteVolume: number
    tradesCount: number
}

export default class OHLCV {
    symbol: string
    timestamp: moment.Moment
    open: number
    high: number
    low: number
    close: number
    baseVolume: number
    quoteVolume: number
    tradesCount: number

    constructor(config: OHLCVconfig) {
        const { symbol, timestamp, open, high, low, close, baseVolume, quoteVolume, tradesCount } = config
        this.symbol = symbol
        this.timestamp = timestamp
        this.open = open
        this.high = high
        this.low = low
        this.close = close
        this.baseVolume = baseVolume
        this.quoteVolume = quoteVolume
        this.tradesCount = tradesCount
    }

    public static fromCSV(csv: string): OHLCV {
        const arr: string[] = csv.split(',')
        if (arr.length !== 10) {
            throw new Error(`Malformed CSV input found: ${csv}`)
        }
        return new OHLCV({
            symbol: arr[2],
            timestamp: moment.unix(parseInt(arr[0], 10) / 1000),
            open: parseFloat(arr[3]),
            high: parseFloat(arr[4]),
            low: parseFloat(arr[5]),
            close: parseFloat(arr[6]),
            baseVolume: parseFloat(arr[7]),
            quoteVolume: parseFloat(arr[8]),
            tradesCount: Math.floor(parseFloat(arr[9]))
        } as OHLCVconfig)
    }
}
