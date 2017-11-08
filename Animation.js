/**
 * @constructor
 * @abstract
 */
class Animation {
	this.current_time = new Date();
	this.old_time = 0;
	constructor() {
		if (this.constructor === Animation) {
      throw new TypeError("Can't instantiate abstract class!");
    }

		if (this.tickTock === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement tickTock()");
		}
	}

	/**
	 * @description Calculates the dot product between the two vectors, normalizing them first
	 * @param arr1 First array to use
	 * @param arr2 Second array to use
	 * @return Dot product, null if there was an error
	 */
	dotProduct(arr1, arr2) {
		let total = 0, div1 = 0, div2 = 0, i = 0;
		if (arr1.length != arr2.length)
			return null;

		for (i = 0; i < arr1.length; i++) {
			div1 += Math.pow(arr1[i],2);
			div2 += Math.pow(arr2[i],2);
		}
		div1 = Math.sqrt(div1);
		div2 = Math.sqrt(div2);

		for (i = 0; i < arr1.length; i++)
			total += ( (arr1[i]/div1)*(arr2[i]/div2) );
		return total;
	}
};
