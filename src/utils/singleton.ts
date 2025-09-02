export class Singleton {
	protected static _instance: any

	protected constructor() {}

	static get instance() {
		return (this._instance ||= new this())
	}
}
