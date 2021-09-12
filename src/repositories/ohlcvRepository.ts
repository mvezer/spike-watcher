import moment from "moment";
import OHLCV from "../entities/OHLCV";

export default class OHLCVrepository implements IterableIterator<OHLCV> {
    private _data: OHLCV[]

    public next(): IteratorResult<OHLCV> {
        let pointer = this.size - 1;
        const data = this._data;
    
        if (pointer >= 0) {
            return {
                done: false,
                value: data[pointer--]
            }
        } else {
            return {
                done: true,
                value: null
            }
        }
    }

    [Symbol.iterator](): IterableIterator<OHLCV> {
        return this;
    }

    constructor(initData?: OHLCV[]) {
        this._data = initData || []
    }

    private convertIndex(rawIndex: number): number {
        if (rawIndex < 0 || rawIndex >= this.size) {
            throw new Error('Index is out of range')
        }

        return this.size - 1 - rawIndex
    }

    addItemFromCSV(csv: string): OHLCV | null {
        const newItem: OHLCV = OHLCV.fromCSV(csv)
        if (!newItem.tradesCount) {
            return null
        }

        this._data.push(newItem)
        return newItem
    }

    get size(): number {
        return this._data.length
    }

    get first(): OHLCV | null{
        if (!this.size) {
            return null
        }

        return this._data[this.size - 1]
    }

    get last(): OHLCV | null{
        if (!this.size) {
            return null
        }

        return this._data[0]
    }

    get data(): OHLCV[] {
        return this._data
    }

    getByIndex(index: number): OHLCV {
        if (index < 0 || index >= this.size ) {
            throw new Error(`Index (${index}) is out of range`)
        }
        return this._data[this.convertIndex(index)]
    }

    timeStampToIndex(timestamp: moment.Moment): number {
        console.log(timestamp)
        const rawIndex = this._data.findIndex((item:OHLCV) => item.timestamp.isSame(timestamp))
        console.log(rawIndex)
        return this.convertIndex(rawIndex)
    }
}