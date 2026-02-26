export default class ModifiedJulianCalendar {
    constructor(date) {
        this.mjd = 0.0;
        this.date = date;
    }
    /*private  leap_gregorian(year:number)
    {
        return ((year % 4) == 0) &&
        (!(((year % 100) == 0) && ((year % 400) != 0)));
    }
  
    private gregorian_to_jd(year:number, month:number, day:number)
    {
        return (ModifiedJulianCalendar.GREGORIAN_EPOCH - 1) +
             (365 * (year - 1)) +
             Math.floor((year - 1) / 4) +
             (-Math.floor((year - 1) / 100)) +
             Math.floor((year - 1) / 400) +
             Math.floor((((367 * month) - 362) / 12) +
             ((month <= 2) ? 0 :
                                 (this.leap_gregorian(year) ? -1 : -2)
             ) +
             day);
    }*/
    getMjd() {
        this.mjd = ((Math.floor((this.date.getTime() / 10000)) * 10000) -
            (Math.floor((ModifiedJulianCalendar.start.getTime() / 10000)) * 10000)) /
            ModifiedJulianCalendar.milliSecInDay;
        return this.mjd;
    }
    getHours() {
        var h = this.date.getUTCHours();
        var m = this.date.getUTCMinutes();
        return (h + (m / 60));
    }
}
// private static GREGORIAN_EPOCH = 1721425.5;
// private static  JMJD  = 2400000.5;  
ModifiedJulianCalendar.start = new Date('November 17, 1858 00:00:00 GMT+00:00');
ModifiedJulianCalendar.milliSecInDay = 1000 * 60 * 60 * 24;
//# sourceMappingURL=ModifiedJulianCalendar.js.map