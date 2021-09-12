export const percentDifference = (a: number, b: number): number => {
    return (b - a) / a;
}

export const formatPercent = (p: number, plusMinus = false): string => {
    const value: number = p * 100
    let sign: string = ''
    if (plusMinus) {
        sign = value < 0 ? '' : '+'
    }
    return `${sign}${Number(value).toPrecision(2)}%`
}