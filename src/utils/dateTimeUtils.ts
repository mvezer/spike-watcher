import moment from 'moment'

export const DATE_TIME_FORMAT = 'DD-MM-YYYY HH:mm:ss'

export const formatDateTime = (m: moment.Moment) => {
    return m.format(DATE_TIME_FORMAT)
}