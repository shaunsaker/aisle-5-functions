import * as moment from 'moment';

export const getTimeAsISOString = (time?: moment.MomentInput) =>
  moment(time).toISOString();
