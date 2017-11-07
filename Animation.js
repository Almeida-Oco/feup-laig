/**
 * @constructor
 * @abstract
 */
var Animation = function(id, speed) {
    if (this.constructor === Animation) {
      throw new TypeError("Can't instantiate abstract class!");
    }

		if (this.apply === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement apply() \n");
		}
};
