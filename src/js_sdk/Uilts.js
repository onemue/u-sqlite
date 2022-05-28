let config = {
    deBug: true,
};

export default class Uilts {


    static log() {
		if (config.deBug) {
			console.log.apply(null, arguments);
		}
	}
	
	static warn() {
		if (config.deBug) {
			console.warn.apply(null, arguments);
		}
	}
	
	static error() {
		console.error.apply(null, arguments);
	}
	
	static isArray(value){ return Object.prototype.toString.call(value) === '[object Array]'}
	static isObject(value){ return Object.prototype.toString.call(value) === '[object Object]'}
	static isString(value){ return Object.prototype.toString.call(value) === '[object String]'}
	static isFunction(value){ return (value === Function || Object.prototype.toString.call(value) === '[object Function]')}
	static isNumber(value){ return (value === Number || Object.prototype.toString.call(value) === '[object Number]')}
	static isNaN(value){ return (Object.prototype.toString.call(value) === '[object Number]' && isNaN(value))}
	static isBoolean(value){ return Object.prototype.toString.call(value) === '[object Boolean]'}
	static isUndefined(value){ return Object.prototype.toString.call(value) === '[object Undefined]'}
	static isModel(value){ return value.constructor.name === 'Model'}
	static isDate(value){ return (value === Date||Object.prototype.toString.call(value) === '[object Date]')}
}