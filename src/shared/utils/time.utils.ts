import { StringUtils } from './string.utils';

export class TimeUtils {
	static getYear(d: Date = new Date(), isShortForm: boolean = false): string {
		if (typeof d === 'string') d = new Date(d);
		let year = d.getFullYear();
		if (isShortForm) year -= 2000;
		return StringUtils.getPadded(year, (isShortForm ? 2 : 4));
	}

	static getTodayUniDate(opts: any = {}): string {
		return TimeUtils.getUniDate(new Date(), opts);
	}

	static getFileFormattedTodayUniDate(opts: any = {}): string {
		return TimeUtils.getUniDateTime().replace(/ /g, '_').replace(/:/g, '-');
	}

	static getUniDate(d: Date = new Date(), opts: any = {}): string {
		const dash = (opts.hasOwnProperty('isUndashed') && opts.isUndashed ? '' : '-');
		return TimeUtils.getYear(d, opts.isShortForm) + dash +
			StringUtils.getPadded(d.getMonth() + 1, 2) + dash +
			StringUtils.getPadded(d.getDate(), 2);
	}

	static utcTimeToLocalUniDateTime(time: number, isShortForm = true) {
		return TimeUtils.getUniDateTime(TimeUtils.utcTimeToLocalDate(time));
	}

	static getCurrUniDateTime(opts: any = {}): string {
		// return TimeUtils.getUniDateTime(new Date(), opts);
		return TimeUtils.getCurrUniDateTimeMs().substr(0, 19);
	}

	static getCurrUniDateTimeMs(opts: any = {}): string {
		const time = new Date();
		const iso = time.toISOString();
		return iso.replace('T', ' ').replace('Z', '');
	}

	static getUniDateTime(d: any = new Date(), opts: any = {}): string {
		const isLongYear = !opts.hasOwnProperty('isLongYear') || opts.isLongYear === true;
		const isSeconds = opts.isSeconds || true;
		if (typeof d === 'number' || typeof d === 'string') {
			d = new Date(String(d));
		}

		let str =
			TimeUtils.getYear(d, !isLongYear) + '-' +
			StringUtils.getPadded(d.getMonth() + 1, 2) + '-' +
			StringUtils.getPadded(d.getDate(), 2) + ' ' +
			StringUtils.getPadded(d.getHours(), 2) + ':' +
			StringUtils.getPadded(d.getMinutes(), 2);
		if (isSeconds) str += ':' + StringUtils.getPadded(d.getSeconds(), 2);
		return str;
	}

	static getUtcDate(d: Date = new Date()) {
		const utcTime = new Date(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds()
		).getTime();
		return new Date(utcTime);
	}

	static getUtcTime(d: Date = new Date()) {
		return d.getTime() + d.getTimezoneOffset() * 60 * 1000;
	}

	static utcTimeToLocalDate(utcTime: number) {
		return new Date(utcTime - new Date().getTimezoneOffset() * 60 * 1000);
	}

	static utcTimeToLocalUniDate(utcTime: number) {
		const d: Date = TimeUtils.utcTimeToLocalDate(utcTime);
		return TimeUtils.getUniDate(d);
	}

	static ms2Time(ms, opts?) {
		return TimeUtils.seconds2Time(Math.round(ms / 1000), opts);
	}

	static prevMs2Time(prevMs, opts?) {
		return TimeUtils.ms2Time(Date.now() - prevMs, opts);
	}

	static seconds2Time(secs, opts = { hours: true }) {
		const isHours = (!opts.hasOwnProperty('hours') || opts.hours);
		let hours = Math.floor(secs / 3600) % 24;
		const minutes = Math.floor(secs / 60) % 60;
		let values = [minutes, secs % 60];
		if (isHours) values.unshift(hours);
		return values
			.map(v => v < 10 ? '0' + v : v)
			.filter((v, i) => v !== '00' || i > 0 || isHours)
			.join(':');
	}

	static epochToTime(epoch, opts) {
		return TimeUtils.seconds2Time(Math.round(epoch / 1000), opts);
	}

	static currTimeToIso() {
		return TimeUtils.epochToIso(Date.now());
	}

	static epochToIso(epoch) {
		return !epoch ? '' : new Date(epoch).toISOString();
	}

	static sleep(time) {
		return new Promise<any>((resolve, reject) => {
			setTimeout(resolve, time);
		});
	}

	static isoDateTime2DbDate(isoDateTime: string): string {
		return TimeUtils.getUniDateTime(new Date(isoDateTime), { isLongYear: true }).substr(0, 10);
	}

	static isoDateTime2DbDateTime(isoDateTime: string): string {
		return TimeUtils.getUniDateTime(new Date(isoDateTime), { isLongYear: true });
	}

	static gregDate2Date(greg) {
		const months = {
			Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
			Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
		};
		const year = greg.substr(8, 4);
		const month = months[greg.substr(0, 3)];
		const day = greg.substr(4, 2);
		const uniDate = `${year}-${month}-${day} 00:00:00`;
		let utcEpoch = (new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0))).valueOf();
		if (utcEpoch < 0) utcEpoch = 0;
		return { uniDate, utcEpoch };
	}
}
