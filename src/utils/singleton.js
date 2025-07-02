export class Singleton {
	static get instance() {
		return (this._instance ||= new this())
	}
}
