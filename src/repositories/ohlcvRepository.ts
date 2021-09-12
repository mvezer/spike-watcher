import OHLCV from "../entities/OHLCV";

export default class OHLCVrepository implements IterableIterator<OHLCV> {
    private data: OHLCV[]

    public next(): IteratorResult<OHLCV> {
        let pointer = this.size - 1;
        const data = this.data;
    
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

    constructor() {
        this.data = []
    }

    addItemFromCSV(csv: string): OHLCV | null {
        const newItem: OHLCV = OHLCV.fromCSV(csv)
        if (!newItem.tradesCount) {
            return null
        }

        this.data.push(newItem)
        return newItem
    }

    get size(): number {
        return this.data.length
    }

    get first(): OHLCV | null{
        if (!this.size) {
            return null
        }

        return this.data[this.size - 1]
    }

    get last(): OHLCV | null{
        if (!this.size) {
            return null
        }

        return this.data[0]
    }

    getByIndex(index: number): OHLCV {
        if (index < 0 || index >= this.size ) {
            throw new Error(`Index (${index}) is out of range`)
        }
        return this.data[this.size - 1 - index]
    }
}