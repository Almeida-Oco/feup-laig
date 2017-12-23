class Object extends CGFobject{
	constructor (scene) {
		this.scene = scene;

		if (this.render === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement render()");
		}
	}
}
