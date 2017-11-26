var DEGREE_TO_RAD = Math.PI / 180;
var getClassOf = Function.prototype.call.bind(Object.prototype.toString);
// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ILLUMINATION_INDEX = 1;
var LIGHTS_INDEX = 2;
var TEXTURES_INDEX = 3;
var MATERIALS_INDEX = 4;
var ANIMATIONS_INDEX = 5;
var NODES_INDEX = 6;

/**
 * @description Contructor for SceneGraph
 * @param file_name Name of the xml file to open
 * @param scene Scene to render the graph
 */
function SceneGraph(filename, scene, myInterface) {
	this.loadedOk = null;
	this.start_time = 0;

	// Establish bidirectional references between scene and graph.
	this.scene = scene;
	scene.graph = this;

	this.nodes = [];
	this.selected_node = "";
	this.nodes_selectable = ['none'];
	this.interface = myInterface;
	this.root_id = null;                    // The id of the root element.

	this.axisCoords = [];
	this.axisCoords["x"] = [1, 0, 0];
	this.axisCoords['y'] = [0, 1, 0];
	this.axisCoords['z'] = [0, 0, 1];

	// File reading
	this.reader = new CGFXMLreader();

	/*
	* Read the contents of the xml file, and refer to this class for loading and error handlers.
	* After the file is read, the reader calls onXMLReady on this object.
	* If any error occurs, the reader calls onXMLError on this object, with an error message
	*/

	this.reader.open('scenes/' + filename, this);
}

/**
 * @description Called when the XML is ready to be read
 */
SceneGraph.prototype.onXMLReady = function()
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseLSXFile(rootElement);

	if (error != null ) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk = true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/**
 * @description Parses the xml file one block at a time
 * @param root_element The root of the graph, where the rendering will start
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseLSXFile = function(rootElement) {
	if (rootElement.nodeName != "SCENE")
		return "root tag <SCENE> missing";

	var nodes = rootElement.children;

	// Reads the names of the nodes to an auxiliary buffer.
	var nodeNames = [];

	for (var i = 0; i < nodes.length; i++) {
		nodeNames.push(nodes[i].nodeName);
	}

	var error;

	// Processes each node, verifying errors.

	// <INITIALS>
	var index;
	if ((index = nodeNames.indexOf("INITIALS")) == -1)
	return "tag <INITIALS> missing";
	else {
		if (index != INITIALS_INDEX)
		this.onXMLMinorError("tag <INITIALS> out of order");

		if ((error = this.parseInitials(nodes[index])) != null )
		return error;
	}

	// <ILLUMINATION>
	if ((index = nodeNames.indexOf("ILLUMINATION")) == -1)
	return "tag <ILLUMINATION> missing";
	else {
		if (index != ILLUMINATION_INDEX)
		this.onXMLMinorError("tag <ILLUMINATION> out of order");

		if ((error = this.parseIllumination(nodes[index])) != null )
		return error;
	}

	// <LIGHTS>
	if ((index = nodeNames.indexOf("LIGHTS")) == -1)
	return "tag <LIGHTS> missing";
	else {
		if (index != LIGHTS_INDEX)
		this.onXMLMinorError("tag <LIGHTS> out of order");

		if ((error = this.parseLights(nodes[index])) != null )
		return error;
	}

	// <TEXTURES>
	if ((index = nodeNames.indexOf("TEXTURES")) == -1)
	return "tag <TEXTURES> missing";
	else {
		if (index != TEXTURES_INDEX)
		this.onXMLMinorError("tag <TEXTURES> out of order");

		if ((error = this.parseTextures(nodes[index])) != null )
		return error;
	}

	// <MATERIALS>
	if ((index = nodeNames.indexOf("MATERIALS")) == -1)
	return "tag <MATERIALS> missing";
	else {
		if (index != MATERIALS_INDEX)
		this.onXMLMinorError("tag <MATERIALS> out of order");

		if ((error = this.parseMaterials(nodes[index])) != null )
		return error;
	}

	// <ANIMATIONS>
	if ((index = nodeNames.indexOf("ANIMATIONS")) == -1)
		return "tag <ANIMATIONS> missing";
	else {
		if (index != ANIMATIONS_INDEX)
			this.onXMLMinorError("tag <ANIMATIONS> out of order");

		if ((error = this.parseAnimations(nodes[index])) != null )
			return error;
	}

	// <NODES>
	if ((index = nodeNames.indexOf("NODES")) == -1)
	return "tag <NODES> missing";
	else {
		if (index != NODES_INDEX)
		this.onXMLMinorError("tag <NODES> out of order");

		if ((error = this.parseNodes(nodes[index])) != null )
		return error;
	}

};

/**
 * @description Parses the Initials block
 * @param initials_node Root node of the initials block, member children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseInitials = function(initialsNode) {

	var children = initialsNode.children;

	var nodeNames = [];

	for (var i = 0; i < children.length; i++)
	nodeNames.push(children[i].nodeName);

	// Frustum planes.
	this.near = 0.1;
	this.far = 500;
	var indexFrustum = nodeNames.indexOf("frustum");
	if (indexFrustum == -1) {
		this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
	}
	else {
		this.near = this.reader.getFloat(children[indexFrustum], 'near');
		this.far = this.reader.getFloat(children[indexFrustum], 'far');

		if (this.near == null ) {
			this.near = 0.1;
			this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
		}
		else if (this.far == null ) {
			this.far = 500;
			this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
		}
		else if (isNaN(this.near)) {
			this.near = 0.1;
			this.onXMLMinorError("non-numeric value found for near plane; assuming 'near = 0.1'");
		}
		else if (isNaN(this.far)) {
			this.far = 500;
			this.onXMLMinorError("non-numeric value found for far plane; assuming 'far = 500'");
		}
		else if (this.near <= 0) {
			this.near = 0.1;
			this.onXMLMinorError("'near' must be positive; assuming 'near = 0.1'");
		}

		if (this.near >= this.far)
		return "'near' must be smaller than 'far'";
	}

	// Checks if at most one translation, three rotations, and one scaling are defined.
	if (initialsNode.getElementsByTagName('translation').length > 1)
	return "no more than one initial translation may be defined";

	if (initialsNode.getElementsByTagName('rotation').length > 3)
	return "no more than three initial rotations may be defined";

	if (initialsNode.getElementsByTagName('scale').length > 1)
	return "no more than one scaling may be defined";

	// Initial transforms.
	this.initialTranslate = [];
	this.initialScaling = [];
	this.initialRotations = [];

	// Gets indices of each element.
	var translationIndex = nodeNames.indexOf("translation");
	var thirdRotationIndex = nodeNames.indexOf("rotation");
	var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
	var firstRotationIndex = nodeNames.lastIndexOf("rotation");
	var scalingIndex = nodeNames.indexOf("scale");

	// Checks if the indices are valid and in the expected order.
	// Translation.
	this.initialTransforms = mat4.create();
	mat4.identity(this.initialTransforms);
	if (translationIndex == -1)
	this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
	else {
		var tx = this.reader.getFloat(children[translationIndex], 'x');
		var ty = this.reader.getFloat(children[translationIndex], 'y');
		var tz = this.reader.getFloat(children[translationIndex], 'z');

		if (tx == null ) {
			tx = 0;
			this.onXMLMinorError("failed to parse x-coordinate of initial translation; assuming tx = 0");
		}
		else if (isNaN(tx)) {
			tx = 0;
			this.onXMLMinorError("found non-numeric value for x-coordinate of initial translation; assuming tx = 0");
		}

		if (ty == null ) {
			ty = 0;
			this.onXMLMinorError("failed to parse y-coordinate of initial translation; assuming ty = 0");
		}
		else if (isNaN(ty)) {
			ty = 0;
			this.onXMLMinorError("found non-numeric value for y-coordinate of initial translation; assuming ty = 0");
		}

		if (tz == null ) {
			tz = 0;
			this.onXMLMinorError("failed to parse z-coordinate of initial translation; assuming tz = 0");
		}
		else if (isNaN(tz)) {
			tz = 0;
			this.onXMLMinorError("found non-numeric value for z-coordinate of initial translation; assuming tz = 0");
		}

		if (translationIndex > thirdRotationIndex || translationIndex > scalingIndex)
		this.onXMLMinorError("initial translation out of order; result may not be as expected");

		mat4.translate(this.initialTransforms, this.initialTransforms, [tx, ty, tz]);
	}

	// Rotations.
	var initialRotations = [];
	initialRotations['x'] = 0;
	initialRotations['y'] = 0;
	initialRotations['z'] = 0;

	var rotationDefined = [];
	rotationDefined['x'] = false;
	rotationDefined['y'] = false;
	rotationDefined['z'] = false;

	var axis;
	var rotationOrder = [];

	// Third rotation (first rotation defined).
	if (thirdRotationIndex != -1) {
		axis = this.reader.getItem(children[thirdRotationIndex], 'axis', ['x', 'y', 'z']);
		if (axis != null ) {
			let angle = this.reader.getFloat(children[thirdRotationIndex], 'angle');
			if (angle != null && !isNaN(angle)) {
				initialRotations[axis] += angle;
				if (!rotationDefined[axis])
				rotationOrder.push(axis);
				rotationDefined[axis] = true;
			}
			else this.onXMLMinorError("failed to parse third initial rotation 'angle'");
		}
	}

	// Second rotation.
	if (secondRotationIndex != -1) {
		axis = this.reader.getItem(children[secondRotationIndex], 'axis', ['x', 'y', 'z']);
		if (axis != null ) {
			let angle = this.reader.getFloat(children[secondRotationIndex], 'angle');
			if (angle != null && !isNaN(angle)) {
				initialRotations[axis] += angle;
				if (!rotationDefined[axis])
				rotationOrder.push(axis);
				rotationDefined[axis] = true;
			}
			else this.onXMLMinorError("failed to parse second initial rotation 'angle'");
		}
	}

	// First rotation.
	if (firstRotationIndex != -1) {
		axis = this.reader.getItem(children[firstRotationIndex], 'axis', ['x', 'y', 'z']);
		if (axis != null ) {
			let angle = this.reader.getFloat(children[firstRotationIndex], 'angle');
			if (angle != null && !isNaN(angle)) {
				initialRotations[axis] += angle;
				if (!rotationDefined[axis])
				rotationOrder.push(axis);
				rotationDefined[axis] = true;
			}
			else this.onXMLMinorError("failed to parse first initial rotation 'angle'");
		}
	}

	// Checks for undefined rotations.
	if (!rotationDefined['x'])
	this.onXMLMinorError("rotation along the Ox axis undefined; assuming Rx = 0");
	else if (!rotationDefined['y'])
	this.onXMLMinorError("rotation along the Oy axis undefined; assuming Ry = 0");
	else if (!rotationDefined['z'])
	this.onXMLMinorError("rotation along the Oz axis undefined; assuming Rz = 0");

	// Updates transform matrix.
	for (var i = 0; i < rotationOrder.length; i++)
	mat4.rotate(this.initialTransforms, this.initialTransforms, DEGREE_TO_RAD * initialRotations[rotationOrder[i]], this.axisCoords[rotationOrder[i]]);

	// Scaling.
	if (scalingIndex == -1)
	this.onXMLMinorError("initial scaling undefined; assuming S = (1, 1, 1)");
	else {
		var sx = this.reader.getFloat(children[scalingIndex], 'sx');
		var sy = this.reader.getFloat(children[scalingIndex], 'sy');
		var sz = this.reader.getFloat(children[scalingIndex], 'sz');

		if (sx == null ) {
			sx = 1;
			this.onXMLMinorError("failed to parse x parameter of initial scaling; assuming sx = 1");
		}
		else if (isNaN(sx)) {
			sx = 1;
			this.onXMLMinorError("found non-numeric value for x parameter of initial scaling; assuming sx = 1");
		}

		if (sy == null ) {
			sy = 1;
			this.onXMLMinorError("failed to parse y parameter of initial scaling; assuming sy = 1");
		}
		else if (isNaN(sy)) {
			sy = 1;
			this.onXMLMinorError("found non-numeric value for y parameter of initial scaling; assuming sy = 1");
		}

		if (sz == null ) {
			sz = 1;
			this.onXMLMinorError("failed to parse z parameter of initial scaling; assuming sz = 1");
		}
		else if (isNaN(sz)) {
			sz = 1;
			this.onXMLMinorError("found non-numeric value for z parameter of initial scaling; assuming sz = 1");
		}

		if (scalingIndex < firstRotationIndex)
		this.onXMLMinorError("initial scaling out of order; result may not be as expected");

		mat4.scale(this.initialTransforms, this.initialTransforms, [sx, sy, sz]);
	}

	// ----------
	// Reference length.
	this.referenceLength = 1;

	var indexReference = nodeNames.indexOf("reference");
	if (indexReference == -1)
	this.onXMLMinorError("reference length undefined; assuming 'length = 1'");
	else {
		// Reads the reference length.
		var length = this.reader.getFloat(children[indexReference], 'length');

		if (length != null ) {
			if (isNaN(length))
			this.onXMLMinorError("found non-numeric value for reference length; assuming 'length = 1'");
			else if (length <= 0)
			this.onXMLMinorError("reference length must be a positive value; assuming 'length = 1'");
			else
			this.referenceLength = length;
		}
		else
		this.onXMLMinorError("unable to parse reference length; assuming 'length = 1'");

	}

	console.log("Parsed initials");

	return null ;
};

/**
 * @description Parses the Illumination block
 * @param illumination_node The root node of the illumination block, children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseIllumination = function(illuminationNode) {

	// Reads the ambient and background values.
	var children = illuminationNode.children;
	var nodeNames = [];
	for (var i = 0; i < children.length; i++)
	nodeNames.push(children[i].nodeName);

	// Retrieves the global ambient illumination.
	this.ambientIllumination = [0, 0, 0, 1];
	var ambientIndex = nodeNames.indexOf("ambient");
	if (ambientIndex != -1) {
		// R.
		var r = this.reader.getFloat(children[ambientIndex], 'r');
		if (r != null ) {
			if (isNaN(r))
			return "ambient 'r' is a non numeric value on the ILLUMINATION block";
			else if (r < 0 || r > 1)
			return "ambient 'r' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.ambientIllumination[0] = r;
		}
		else
		this.onXMLMinorError("unable to parse R component of the ambient illumination; assuming R = 0");

		// G.
		var g = this.reader.getFloat(children[ambientIndex], 'g');
		if (g != null ) {
			if (isNaN(g))
			return "ambient 'g' is a non numeric value on the ILLUMINATION block";
			else if (g < 0 || g > 1)
			return "ambient 'g' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.ambientIllumination[1] = g;
		}
		else
		this.onXMLMinorError("unable to parse G component of the ambient illumination; assuming G = 0");

		// B.
		var b = this.reader.getFloat(children[ambientIndex], 'b');
		if (b != null ) {
			if (isNaN(b))
			return "ambient 'b' is a non numeric value on the ILLUMINATION block";
			else if (b < 0 || b > 1)
			return "ambient 'b' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.ambientIllumination[2] = b;
		}
		else
		this.onXMLMinorError("unable to parse B component of the ambient illumination; assuming B = 0");

		// A.
		var a = this.reader.getFloat(children[ambientIndex], 'a');
		if (a != null ) {
			if (isNaN(a))
			return "ambient 'a' is a non numeric value on the ILLUMINATION block";
			else if (a < 0 || a > 1)
			return "ambient 'a' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.ambientIllumination[3] = a;
		}
		else
		this.onXMLMinorError("unable to parse A component of the ambient illumination; assuming A = 1");
	}
	else
	this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0, 0, 0, 1)");

	// Retrieves the background clear color.
	this.background = [0, 0, 0, 1];
	var backgroundIndex = nodeNames.indexOf("background");
	if (backgroundIndex != -1) {
		// R.
		var r = this.reader.getFloat(children[backgroundIndex], 'r');
		if (r != null ) {
			if (isNaN(r))
			return "background 'r' is a non numeric value on the ILLUMINATION block";
			else if (r < 0 || r > 1)
			return "background 'r' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.background[0] = r;
		}
		else
		this.onXMLMinorError("unable to parse R component of the background colour; assuming R = 0");

		// G.
		var g = this.reader.getFloat(children[backgroundIndex], 'g');
		if (g != null ) {
			if (isNaN(g))
			return "background 'g' is a non numeric value on the ILLUMINATION block";
			else if (g < 0 || g > 1)
			return "background 'g' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.background[1] = g;
		}
		else
		this.onXMLMinorError("unable to parse G component of the background colour; assuming G = 0");

		// B.
		var b = this.reader.getFloat(children[backgroundIndex], 'b');
		if (b != null ) {
			if (isNaN(b))
			return "background 'b' is a non numeric value on the ILLUMINATION block";
			else if (b < 0 || b > 1)
			return "background 'b' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.background[2] = b;
		}
		else
		this.onXMLMinorError("unable to parse B component of the background colour; assuming B = 0");

		// A.
		var a = this.reader.getFloat(children[backgroundIndex], 'a');
		if (a != null ) {
			if (isNaN(a))
			return "background 'a' is a non numeric value on the ILLUMINATION block";
			else if (a < 0 || a > 1)
			return "background 'a' must be a value between 0 and 1 on the ILLUMINATION block"
			else
			this.background[3] = a;
		}
		else
		this.onXMLMinorError("unable to parse A component of the background colour; assuming A = 1");
	}
	else
	this.onXMLMinorError("background clear colour undefined; assuming (R, G, B, A) = (0, 0, 0, 1)");

	console.log("Parsed illumination");

	return null ;
};

/**
 * @description Parses the Lights block
 * @param lights_node The root node of the lights block, member children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseLights = function(lightsNode) {

	var children = lightsNode.children;

	this.lights = [];
	var numLights = 0;

	var grandChildren = [];
	var nodeNames = [];

	// Any number of lights.
	for (var i = 0; i < children.length; i++) {

		if (children[i].nodeName != "LIGHT") {
			this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
			continue;
		}

		// Get id of the current light.
		var lightId = this.reader.getString(children[i], 'id');
		if (lightId == null )
		return "no ID defined for light";

		// Checks for repeated IDs.
		if (this.lights[lightId] != null )
		return "ID must be unique for each light (conflict: ID = " + lightId + ")";

		grandChildren = children[i].children;
		// Specifications for the current light.

		nodeNames = [];
		for (var j = 0; j < grandChildren.length; j++) {
			console.log(grandChildren[j].nodeName);
			nodeNames.push(grandChildren[j].nodeName);
		}

		// Gets indices of each element.
		var enableIndex = nodeNames.indexOf("enable");
		var positionIndex = nodeNames.indexOf("position");
		var ambientIndex = nodeNames.indexOf("ambient");
		var diffuseIndex = nodeNames.indexOf("diffuse");
		var specularIndex = nodeNames.indexOf("specular");

		// Light enable/disable
		var enableLight = true;
		if (enableIndex == -1) {
			this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
		}
		else {
			var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
			if (aux == null ) {
				this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
			}
			else if (isNaN(aux))
			return "'enable value' is a non numeric value on the LIGHTS block";
			else if (aux != 0 &&     aux != 1)
			return "'enable value' must be 0 or 1 on the LIGHTS block"
			else
			enableLight = aux == 0 ? false : true;
		}

		// Retrieves the light position.
		var positionLight = [];
		if (positionIndex != -1) {
			// x
			var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
			if (x != null ) {
				if (isNaN(x))
				return "'x' is a non numeric value on the LIGHTS block";
				else
				positionLight.push(x);
			}
			else
			return "unable to parse x-coordinate of the light position for ID = " + lightId;

			// y
			var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
			if (y != null ) {
				if (isNaN(y))
				return "'y' is a non numeric value on the LIGHTS block";
				else
				positionLight.push(y);
			}
			else
			return "unable to parse y-coordinate of the light position for ID = " + lightId;

			// z
			var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
			if (z != null ) {
				if (isNaN(z))
				return "'z' is a non numeric value on the LIGHTS block";
				else
				positionLight.push(z);
			}
			else
			return "unable to parse z-coordinate of the light position for ID = " + lightId;

			// w
			var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
			if (w != null ) {
				if (isNaN(w))
				return "'w' is a non numeric value on the LIGHTS block";
				else if (w < 0 || w > 1)
				return "'w' must be a value between 0 and 1 on the LIGHTS block"
				else
				positionLight.push(w);
			}
			else
			return "unable to parse w-coordinate of the light position for ID = " + lightId;
		}
		else
		return "light position undefined for ID = " + lightId;

		// Retrieves the ambient component.
		var ambientIllumination = [];
		if (ambientIndex != -1) {
			// R
			var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
			if (r != null ) {
				if (isNaN(r))
				return "ambient 'r' is a non numeric value on the LIGHTS block";
				else if (r < 0 || r > 1)
				return "ambient 'r' must be a value between 0 and 1 on the LIGHTS block"
				else
				ambientIllumination.push(r);
			}
			else
			return "unable to parse R component of the ambient illumination for ID = " + lightId;

			// G
			var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
			if (g != null ) {
				if (isNaN(g))
				return "ambient 'g' is a non numeric value on the LIGHTS block";
				else if (g < 0 || g > 1)
				return "ambient 'g' must be a value between 0 and 1 on the LIGHTS block"
				else
				ambientIllumination.push(g);
			}
			else
			return "unable to parse G component of the ambient illumination for ID = " + lightId;

			// B
			var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
			if (b != null ) {
				if (isNaN(b))
				return "ambient 'b' is a non numeric value on the LIGHTS block";
				else if (b < 0 || b > 1)
				return "ambient 'b' must be a value between 0 and 1 on the LIGHTS block"
				else
				ambientIllumination.push(b);
			}
			else
			return "unable to parse B component of the ambient illumination for ID = " + lightId;

			// A
			var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
			if (a != null ) {
				if (isNaN(a))
				return "ambient 'a' is a non numeric value on the LIGHTS block";
				else if (a < 0 || a > 1)
				return "ambient 'a' must be a value between 0 and 1 on the LIGHTS block"
				ambientIllumination.push(a);
			}
			else
			return "unable to parse A component of the ambient illumination for ID = " + lightId;
		}
		else
		return "ambient component undefined for ID = " + lightId;

		// Retrieves the diffuse component
		var diffuseIllumination = [];
		if (diffuseIndex != -1) {
			// R
			var r = this.reader.getFloat(grandChildren[diffuseIndex], 'r');
			if (r != null ) {
				if (isNaN(r))
				return "diffuse 'r' is a non numeric value on the LIGHTS block";
				else if (r < 0 || r > 1)
				return "diffuse 'r' must be a value between 0 and 1 on the LIGHTS block"
				else
				diffuseIllumination.push(r);
			}
			else
			return "unable to parse R component of the diffuse illumination for ID = " + lightId;

			// G
			var g = this.reader.getFloat(grandChildren[diffuseIndex], 'g');
			if (g != null ) {
				if (isNaN(g))
				return "diffuse 'g' is a non numeric value on the LIGHTS block";
				else if (g < 0 || g > 1)
				return "diffuse 'g' must be a value between 0 and 1 on the LIGHTS block"
				else
				diffuseIllumination.push(g);
			}
			else
			return "unable to parse G component of the diffuse illumination for ID = " + lightId;

			// B
			var b = this.reader.getFloat(grandChildren[diffuseIndex], 'b');
			if (b != null ) {
				if (isNaN(b))
				return "diffuse 'b' is a non numeric value on the LIGHTS block";
				else if (b < 0 || b > 1)
				return "diffuse 'b' must be a value between 0 and 1 on the LIGHTS block"
				else
				diffuseIllumination.push(b);
			}
			else
			return "unable to parse B component of the diffuse illumination for ID = " + lightId;

			// A
			var a = this.reader.getFloat(grandChildren[diffuseIndex], 'a');
			if (a != null ) {
				if (isNaN(a))
				return "diffuse 'a' is a non numeric value on the LIGHTS block";
				else if (a < 0 || a > 1)
				return "diffuse 'a' must be a value between 0 and 1 on the LIGHTS block"
				else
				diffuseIllumination.push(a);
			}
			else
			return "unable to parse A component of the diffuse illumination for ID = " + lightId;
		}
		else
		return "diffuse component undefined for ID = " + lightId;

		// Retrieves the specular component
		var specularIllumination = [];
		if (specularIndex != -1) {
			// R
			var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
			if (r != null ) {
				if (isNaN(r))
				return "specular 'r' is a non numeric value on the LIGHTS block";
				else if (r < 0 || r > 1)
				return "specular 'r' must be a value between 0 and 1 on the LIGHTS block"
				else
				specularIllumination.push(r);
			}
			else
			return "unable to parse R component of the specular illumination for ID = " + lightId;

			// G
			var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
			if (g != null ) {
				if (isNaN(g))
				return "specular 'g' is a non numeric value on the LIGHTS block";
				else if (g < 0 || g > 1)
				return "specular 'g' must be a value between 0 and 1 on the LIGHTS block"
				else
				specularIllumination.push(g);
			}
			else
			return "unable to parse G component of the specular illumination for ID = " + lightId;

			// B
			var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
			if (b != null ) {
				if (isNaN(b))
				return "specular 'b' is a non numeric value on the LIGHTS block";
				else if (b < 0 || b > 1)
				return "specular 'b' must be a value between 0 and 1 on the LIGHTS block"
				else
				specularIllumination.push(b);
			}
			else
			return "unable to parse B component of the specular illumination for ID = " + lightId;

			// A
			var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
			if (a != null ) {
				if (isNaN(a))
				return "specular 'a' is a non numeric value on the LIGHTS block";
				else if (a < 0 || a > 1)
				return "specular 'a' must be a value between 0 and 1 on the LIGHTS block"
				else
				specularIllumination.push(a);
			}
			else
			return "unable to parse A component of the specular illumination for ID = " + lightId;
		}
		else
		return "specular component undefined for ID = " + lightId;

		// Light global information.
		this.lights[lightId] = [enableLight, positionLight, ambientIllumination, diffuseIllumination, specularIllumination];
		numLights++;
	}

	if (numLights == 0)
	return "at least one light must be defined";
	else if (numLights > 8)
	this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

	console.log("Parsed lights");

	return null ;
};

/**
 * @description Parses the Textures block
 * @param lights_node The root node of the textures block, member children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseTextures = function(texturesNode) {

	this.textures = [];

	var eachTexture = texturesNode.children;
	// Each texture.

	var oneTextureDefined = false;

	for (var i = 0; i < eachTexture.length; i++) {
		var nodeName = eachTexture[i].nodeName;
		if (nodeName == "TEXTURE") {
			// Retrieves texture ID.
			var textureID = this.reader.getString(eachTexture[i], 'id');
			if (textureID == null )
			return "failed to parse texture ID";
			// Checks if ID is valid.
			if (this.textures[textureID] != null )
			return "texture ID must unique (conflict with ID = " + textureID + ")";

			var texSpecs = eachTexture[i].children;
			var filepath = null ;
			var amplifFactorS = null ;
			var amplifFactorT = null ;
			// Retrieves texture specifications.
			for (var j = 0; j < texSpecs.length; j++) {
				var name = texSpecs[j].nodeName;
				if (name == "file") {
					if (filepath != null )
						return "duplicate file paths in texture with ID = " + textureID;

					filepath = this.reader.getString(texSpecs[j], 'path');
					if (filepath == null )
						return "unable to parse texture file path for ID = " + textureID;
				}
				else if (name == "amplif_factor") {
					if (amplifFactorS != null  || amplifFactorT != null )
					return "duplicate amplification factors in texture with ID = " + textureID;

					amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
					amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

					if (amplifFactorS == null  || amplifFactorT == null )
					return "unable to parse texture amplification factors for ID = " + textureID;
					else if (isNaN(amplifFactorS))
					return "'amplifFactorS' is a non numeric value";
					else if (isNaN(amplifFactorT))
					return "'amplifFactorT' is a non numeric value";
					else if (amplifFactorS <= 0 || amplifFactorT <= 0)
					return "value for amplifFactor must be positive";
				}
				else
				this.onXMLMinorError("unknown tag name <" + name + ">");
			}

			if (filepath == null )
				return "file path undefined for texture with ID = " + textureID;
			else if (amplifFactorS == null )
				return "s amplification factor undefined for texture with ID = " + textureID;
			else if (amplifFactorT == null )
				return "t amplification factor undefined for texture with ID = " + textureID;

			var texture = new CGFtexture(this.scene,"./scenes/" + filepath);

			this.textures[textureID] = [texture, amplifFactorS, amplifFactorT];
			oneTextureDefined = true;
		}
		else
		this.onXMLMinorError("unknown tag name <" + nodeName + ">");
	}

	if (!oneTextureDefined)
	return "at least one texture must be defined in the TEXTURES block";

	console.log("Parsed textures");
}

/**
 * @description Parses the Materials block
 * @param lights_node The root node of the material block, member children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseMaterials = function(materialsNode) {
	var children = materialsNode.children;
	// Each material.

	this.materials = [];

	var oneMaterialDefined = false;

	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeName != "MATERIAL") {
			this.onXMLMinorError("unknown tag name <" + children[i].nodeName + ">");
			continue;
		}

		var materialID = this.reader.getString(children[i], 'id');
		if (materialID == null )
			return "no ID defined for material";

		if (this.materials[materialID] != null )
			return "ID must be unique for each material (conflict: ID = " + materialID + ")";

		var materialSpecs = children[i].children;

		var nodeNames = [];

		for (var j = 0; j < materialSpecs.length; j++)
		nodeNames.push(materialSpecs[j].nodeName);

		// Determines the values for each field.
		// Shininess.
		var shininessIndex = nodeNames.indexOf("shininess");
		if (shininessIndex == -1)
			return "no shininess value defined for material with ID = " + materialID;
		var shininess = this.reader.getFloat(materialSpecs[shininessIndex], 'value');
		if (shininess == null )
			return "unable to parse shininess value for material with ID = " + materialID;
		else if (isNaN(shininess))
			return "'shininess' is a non numeric value";
		else if (shininess <= 0)
			return "'shininess' must be positive";

		// Specular component.
		var specularIndex = nodeNames.indexOf("specular");
		if (specularIndex == -1)
		return "no specular component defined for material with ID = " + materialID;
		var specularComponent = [];
		// R.
		var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');
		if (r == null )
		return "unable to parse R component of specular reflection for material with ID = " + materialID;
		else if (isNaN(r))
		return "specular 'r' is a non numeric value on the MATERIALS block";
		else if (r < 0 || r > 1)
		return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
		specularComponent.push(r);
		// G.
		var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');
		if (g == null )
		return "unable to parse G component of specular reflection for material with ID = " + materialID;
		else if (isNaN(g))
		return "specular 'g' is a non numeric value on the MATERIALS block";
		else if (g < 0 || g > 1)
		return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
		specularComponent.push(g);
		// B.
		var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');
		if (b == null )
		return "unable to parse B component of specular reflection for material with ID = " + materialID;
		else if (isNaN(b))
		return "specular 'b' is a non numeric value on the MATERIALS block";
		else if (b < 0 || b > 1)
		return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
		specularComponent.push(b);
		// A.
		var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
		if (a == null )
		return "unable to parse A component of specular reflection for material with ID = " + materialID;
		else if (isNaN(a))
		return "specular 'a' is a non numeric value on the MATERIALS block";
		else if (a < 0 || a > 1)
		return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
		specularComponent.push(a);

		// Diffuse component.
		var diffuseIndex = nodeNames.indexOf("diffuse");
		if (diffuseIndex == -1)
		return "no diffuse component defined for material with ID = " + materialID;
		var diffuseComponent = [];
		// R.
		r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');
		if (r == null )
		return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
		else if (isNaN(r))
		return "diffuse 'r' is a non numeric value on the MATERIALS block";
		else if (r < 0 || r > 1)
		return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
		diffuseComponent.push(r);
		// G.
		g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
		if (g == null )
		return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
		else if (isNaN(g))
		return "diffuse 'g' is a non numeric value on the MATERIALS block";
		else if (g < 0 || g > 1)
		return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
		diffuseComponent.push(g);
		// B.
		b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');
		if (b == null )
		return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
		else if (isNaN(b))
		return "diffuse 'b' is a non numeric value on the MATERIALS block";
		else if (b < 0 || b > 1)
		return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
		diffuseComponent.push(b);
		// A.
		a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
		if (a == null )
		return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
		else if (isNaN(a))
		return "diffuse 'a' is a non numeric value on the MATERIALS block";
		else if (a < 0 || a > 1)
		return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
		diffuseComponent.push(a);

		// Ambient component.
		var ambientIndex = nodeNames.indexOf("ambient");
		if (ambientIndex == -1)
		return "no ambient component defined for material with ID = " + materialID;
		var ambientComponent = [];
		// R.
		r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
		if (r == null )
		return "unable to parse R component of ambient reflection for material with ID = " + materialID;
		else if (isNaN(r))
		return "ambient 'r' is a non numeric value on the MATERIALS block";
		else if (r < 0 || r > 1)
		return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
		ambientComponent.push(r);
		// G.
		g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');
		if (g == null )
		return "unable to parse G component of ambient reflection for material with ID = " + materialID;
		else if (isNaN(g))
		return "ambient 'g' is a non numeric value on the MATERIALS block";
		else if (g < 0 || g > 1)
		return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
		ambientComponent.push(g);
		// B.
		b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');
		if (b == null )
		return "unable to parse B component of ambient reflection for material with ID = " + materialID;
		else if (isNaN(b))
		return "ambient 'b' is a non numeric value on the MATERIALS block";
		else if (b < 0 || b > 1)
		return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
		ambientComponent.push(b);
		// A.
		a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
		if (a == null )
		return "unable to parse A component of ambient reflection for material with ID = " + materialID;
		else if (isNaN(a))
		return "ambient 'a' is a non numeric value on the MATERIALS block";
		else if (a < 0 || a > 1)
		return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
		ambientComponent.push(a);

		// Emission component.
		var emissionIndex = nodeNames.indexOf("emission");
		if (emissionIndex == -1)
		return "no emission component defined for material with ID = " + materialID;
		var emissionComponent = [];
		// R.
		r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
		if (r == null )
		return "unable to parse R component of emission for material with ID = " + materialID;
		else if (isNaN(r))
		return "emisson 'r' is a non numeric value on the MATERIALS block";
		else if (r < 0 || r > 1)
		return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
		emissionComponent.push(r);
		// G.
		g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
		if (g == null )
		return "unable to parse G component of emission for material with ID = " + materialID;
		if (isNaN(g))
		return "emisson 'g' is a non numeric value on the MATERIALS block";
		else if (g < 0 || g > 1)
		return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
		emissionComponent.push(g);
		// B.
		b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
		if (b == null )
		return "unable to parse B component of emission for material with ID = " + materialID;
		else if (isNaN(b))
		return "emisson 'b' is a non numeric value on the MATERIALS block";
		else if (b < 0 || b > 1)
		return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
		emissionComponent.push(b);
		// A.
		a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
		if (a == null )
		return "unable to parse A component of emission for material with ID = " + materialID;
		else if (isNaN(a))
		return "emisson 'a' is a non numeric value on the MATERIALS block";
		else if (a < 0 || a > 1)
		return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
		emissionComponent.push(a);

		// Creates material with the specified characteristics.
		var newMaterial = new CGFappearance(this.scene);
		newMaterial.setShininess(shininess);
		newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
		newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
		newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
		newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
		this.materials[materialID] = newMaterial;
		oneMaterialDefined = true;
	}

	if (!oneMaterialDefined)
	return "at least one material must be defined on the MATERIALS block";

	// Generates a default material.
	this.generateDefaultMaterial();

	console.log("Parsed materials");
}

SceneGraph.prototype.parseAnimations = function(animations_node) {
	let children = animations_node.children;
	this.animations = new Map();

	for (let i = 0; i < children.length; i++) {
		let child = children[i], animation_speed = 0;
		if (child.nodeName != "ANIMATION") {
			this.onXMLMinorError("unknown tag name <" + child.nodeName + ">");
			continue;
		}

		let animation_id = this.reader.getString(child, 'id'),
				animation_type = this.reader.getString(child, 'type'),
				possible_values= ["linear", "circular", "bezier", "combo"];

		if (animation_id == null)
			return "no ID defined for animation";
		if (this.animations.get(animation_id) != null)
			return "ID for animation must be unique: " + animation_id;

		if (animation_type == null)
			return "no type defined for animation: " + animation_id;
		if (possible_values.indexOf(animation_type) == -1)
			return "unknown animation type: " + possible_values;

		if (animation_type != "combo"){ //combo has no speed
			animation_speed = this.reader.getFloat(child, 'speed');
			if (animation_speed == null)
				return "no speed defined for animation: " + animation_id;
		}

		let ret_val;
		if ("linear" == animation_type)
			ret_val = this.parseLinearAnimation(child, animation_id, animation_speed);
		else if ("circular" == animation_type)
			ret_val = this.parseCircularAnimation(child, animation_id, animation_speed);
		else if ("bezier" == animation_type)
			ret_val = this.parseBezierAnimation(child, animation_id, animation_speed);
		else if ("combo" == animation_type)
			ret_val = this.parseComboAnimation(child, animation_id, animation_speed);
		else
			return "?how did I get here? animation_type: " + animation_type;

		if (ret_val != null) //an animation parse error
			return ret_val;
	}

	let animations_it = this.animations.values();
	for (let animation of animations_it){
		if (animation.constructor.name == "ComboAnimation"){
			animation.setAnimations(this.animations);
		}
	}

}


SceneGraph.prototype.parseLinearAnimation = function(animation_node, id, speed) {
	let children = animation_node.children, args = [], i = 0;
	if (children.length < 2) {
		return "at least 2 controlpoints must be defined for linear animation: " + id;
	}

	for (i = 0; i < children.length; i++) {
		let child = children[i], pts = [];
		if (child.nodeName != "controlpoint") {
			this.onXMLMinorError("unknown linear animation tag name <" + child.nodeName + ">");
			continue;
		}

		let x = this.reader.getFloat(child, 'xx'),
				y = this.reader.getFloat(child, 'yy'),
				z = this.reader.getFloat(child, 'zz');

		if (x == null)
			return "no x point defined in control point of linear animation: " + id;
		if (y == null)
			return "no y point defined in control point of linear animation: " + id;
		if (z == null)
			return "no z point defined in control point of linear animation: " + id;

		pts.push(x); pts.push(y); pts.push(z);
		args.push(pts);
	}
	if (i == 0)
		return "no control point defined of linear animation: " + id;

	let value = new LinearAnimation(speed, args);
	this.animations.set(id, value);

	return null;
}

SceneGraph.prototype.parseCircularAnimation = function(animation_node, id, speed) {
	let centerx = this.reader.getFloat(animation_node, 'centerx' ),
			centery = this.reader.getFloat(animation_node, 'centery' ),
			centerz = this.reader.getFloat(animation_node, 'centerz' ),
			radius  = this.reader.getFloat(animation_node, 'radius'  ),
			startang= this.reader.getFloat(animation_node, 'startang'),
			rotang  = this.reader.getFloat(animation_node, 'rotang'  ),
			loop 		= this.reader.getBoolean(animation_node, 'loop'),
			args 	 	= [];

	if (centerx == null)
		return "no centerx defined for animation: " + id;
	if (centery == null)
		return "no centery defined for animation: " + id;
	if (centerz == null)
		return "no centerz defined for animation: " + id;
	if (radius == null)
		return "no radius defined for animation:" + id;
	if (startang == null)
		return "no startang defined for animation: " + id;
	if (rotang == null)
		return "no rotang defined for animation: " + id;
	if (loop == null)
		loop = false;

	console.log(loop);
	args.push(centerx); args.push(centery); 	args.push(centerz);
	args.push(radius);  args.push(startang);	args.push(rotang);
	args.push(loop);

	let value = new CircularAnimation(speed, args);
	this.animations.set(id, value);

	return null;
}

SceneGraph.prototype.parseBezierAnimation = function(animation_node, id, speed) {
	let children = animation_node.children, args = [];
	for (let i = 0; i < children.length; i++) {
		let child = children[i], pts = [];

		let x = this.reader.getFloat(child, 'xx'),
				y = this.reader.getFloat(child, 'yy'),
				z = this.reader.getFloat(child, 'zz');

		if (x == null)
			return "no x defined in control point of bezier animation: " + id;
		if (y == null)
			return "no y defined in control point of bezier animation: " + id;
		if (z == null)
			return "no z defined in control point of bezier animation: " + id;

		pts.push(x); pts.push(y); pts.push(z);
		args.push(pts);
	}

	let value = new BezierAnimation(speed, args);
	this.animations.set(id, value);

	return null
}

SceneGraph.prototype.parseComboAnimation = function(animation_node, id) {
	let children = animation_node.children,
			i = 0,
			args = [];

	for (i = 0; i < children.length; i++){
		let child = children[i];
		if (child.nodeName != "SPANREF"){
			this.onXMLMinorError("unknown combo animation tag name <" + child.nodeName + ">");
			continue;
		}
		let animation_id = this.reader.getString(child, 'id');
		if (animation_id == null)
			return "no animation id defined in combo animation: " + id;

		args.push(animation_id);
	}
	if (i == 0)
		return "at least one animation must be specified in combo animation: " + id;

	let value = new ComboAnimation(args);
	this.animations.set(id, value);

	return null;
}

/**
 * @description Parses the Nodes block
 * @param lights_node The root node of the node block, member children contains the elements
 * @return null if there was no error, error message otherwise
 */
SceneGraph.prototype.parseNodes = function(nodesNode) {
	var children = nodesNode.children;

	for (var i = 0; i < children.length; i++) {
		var nodeName;
		if ((nodeName = children[i].nodeName) == "ROOT") {
			// Retrieves root node.
			if (this.root_id != null )
				return "there can only be one root node";
			else {
				var root = this.reader.getString(children[i], 'id');
				if (root == null )
					return "failed to retrieve root node ID";

				this.root_id = root;
			}
		}
		else if (nodeName == "NODE") {
			let nodeID = this.reader.getString(children[i], 'id'),
					node_select = null;

			if (this.reader.hasAttribute(children[i], 'selectable'))
				node_select = this.reader.getBoolean(children[i], 'selectable');

			if (nodeID == null )
				return "failed to retrieve node ID";
			if (node_select == null)
				node_select = false;

			if (this.nodes[nodeID] != null )
				return "node ID must be unique (conflict: ID = " + nodeID + ")";

			this.log("Processing node "+nodeID);

			// Creates node.
			this.nodes[nodeID] = new GraphNode(nodeID, node_select);
			if (node_select){
				this.nodes_selectable.push(nodeID);
			}
			// Gathers child nodes.
			var nodeSpecs = children[i].children;
			var specsNames = [];
			var possibleValues = ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "DESCENDANTS", "ANIMATIONREFS"];
			for (var j = 0; j < nodeSpecs.length; j++) {
				var name = nodeSpecs[j].nodeName;
				specsNames.push(nodeSpecs[j].nodeName);

				// Warns against possible invalid tag names.
				if (possibleValues.indexOf(name) == -1)
					this.onXMLMinorError("unknown tag <" + name + ">");
			}

			// Retrieves material ID.
			var materialIndex = specsNames.indexOf("MATERIAL");
			if (materialIndex == -1)
				return "material must be defined (node ID = " + nodeID + ")";
			var materialID = this.reader.getString(nodeSpecs[materialIndex], 'id');
			if (materialID == null )
				return "unable to parse material ID (node ID = " + nodeID + ")";
			if (materialID != "null" && this.materials[materialID] == null )
				return "ID does not correspond to a valid material (node ID = " + nodeID + ")";

			this.nodes[nodeID].materialID = materialID;

			// Retrieves texture ID.
			var textureIndex = specsNames.indexOf("TEXTURE");
			if (textureIndex == -1)
				return "texture must be defined (node ID = " + nodeID + ")";
			var textureID = this.reader.getString(nodeSpecs[textureIndex], 'id');
			if (textureID == null )
				return "unable to parse texture ID (node ID = " + nodeID + ")";
			if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null )
				return "ID does not correspond to a valid texture (node ID = " + nodeID + ")";

			this.nodes[nodeID].textureID = textureID;

			// Possible values in node
			for (var j = 0; j < nodeSpecs.length; j++) {
				let name = nodeSpecs[j].nodeName;

				if ("TRANSLATION" == name) {
					let x = this.reader.getFloat(nodeSpecs[j], 'x'),
							y = this.reader.getFloat(nodeSpecs[j], 'y'),
							z = this.reader.getFloat(nodeSpecs[j], 'z');
					if (x == null || isNaN(x)) {
						this.onXMLMinorError("unable to parse x-coordinate of translation (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					if (y == null || isNaN(y)) {
						this.onXMLMinorError("unable to parse y-coordinate of translation (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					if (z == null || isNaN(z)) {
						this.onXMLMinorError("unable to parse z-coordinate of translation (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					mat4.translate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [x, y, z]);
				}
				else if ("ROTATION" == name) {
					let axis = this.reader.getItem(nodeSpecs[j], 'axis', ['x', 'y', 'z']),
							angle= this.reader.getFloat(nodeSpecs[j], 'angle');

					if (axis == null) {
						this.onXMLMinorError("unable to parse rotation axis (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					if (angle == null || isNaN(angle)) {
						this.onXMLMinorError("unable to parse rotation angle (node ID = " + nodeID + ") discarding transform");
						continue;
					}

					mat4.rotate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
				}
				else if ("SCALE" == name) {
					let sx = this.reader.getFloat(nodeSpecs[j], 'sx'),
							sy = this.reader.getFloat(nodeSpecs[j], 'sy'),
							sz = this.reader.getFloat(nodeSpecs[j], 'sz');

					if (sx == null || isNaN(sx)) {
						this.onXMLMinorError("unable to parse x component of scaling (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					if (sy == null || isNaN(sy)) {
						this.onXMLMinorError("unable to parse y component of scaling (node ID = " + nodeID + ") discarding transform");
						continue;
					}
					if (sz == null || isNaN(sz)) {
						this.onXMLMinorError("unable to parse z component of scaling(node ID = " + nodeID + ") discarding transform");
						continue;
					}

					mat4.scale(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [sx, sy, sz]);
				}
				else if ("ANIMATIONREFS" == name) {
					let animation_childs = nodeSpecs[j].children;
					for (let k = 0; k < animation_childs.length; k++) {
						let animation_id = this.reader.getString(animation_childs[k], 'id');
						if (animation_id == null || this.animations.get(animation_id) == null) {
							this.onXMLMinorError("Animation ID does not correspond to a valid animation in (node ID = " + nodeID + ") discarding animation");
							continue;
						}
						console.log("Adding animation : "+animation_id+" to node: "+nodeID);
						this.nodes[nodeID].addAnimation(this.animations.get(animation_id));
					}

				}
			}


			// Retrieves information about children.
			var descendantsIndex = specsNames.indexOf("DESCENDANTS");
			if (descendantsIndex == -1)
			return "an intermediate node must have descendants";

			var descendants = nodeSpecs[descendantsIndex].children;

			var sizeChildren = 0;
			for (var j = 0; j < descendants.length; j++) {
				if (descendants[j].nodeName == "NODEREF")
				{

					var curId = this.reader.getString(descendants[j], 'id');

					this.log("   Descendant: "+curId);

					if (curId == null )
					this.onXMLMinorError("unable to parse descendant id");
					else if (curId == nodeID)
					return "a node may not be a child of its own";
					else {
						this.nodes[nodeID].addChild(curId);
						sizeChildren++;
					}
				}
				else
				if (descendants[j].nodeName == "LEAF")
				{
					var type=this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle','patch']);
					if (type != null)
						this.log("   Leaf: "+ type);
					else
						this.warn("Error in leaf");

					var args = [];
					if ("patch" == type){
						var cplines = descendants[j].children, control_points=[];
						let max_order = cplines[0].children.length;
						args.push(cplines.length-1);
						args.push(cplines[0].children.length-1);
						args.push(parseFloat(this.reader.getString(descendants[j],'partsU')));
						args.push(parseFloat(this.reader.getString(descendants[j],'partsV')));

						for (var cplines_i = 0 ; cplines_i < cplines.length ; cplines_i++){
							if (cplines[cplines_i].children.length != max_order){
								console.log("ERROR! OrderV not unidorm!\n");
								exit(1);
							}
							for (var cpts_i = 0 ; cpts_i < cplines[cplines_i].children.length ; cpts_i++){
								let pts = cplines[cplines_i].children[cpts_i];
								var x = this.reader.getFloat(pts,'xx',false);
								var y = this.reader.getFloat(pts,'yy',false);
								var z = this.reader.getFloat(pts,'zz',false);
								var w = this.reader.getFloat(pts,'ww',false);
								control_points.push([x,y,z,w]);
							}

						}

						args.push(control_points);
					}
					else {
						args=this.reader.getString(descendants[j],'args').split(' ');
					}

					this.nodes[nodeID].addLeaf(new GraphLeaf(type, args, this.scene));

					sizeChildren++;
				}
				else
				this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");

			}
			if (sizeChildren == 0)
			return "at least one descendant must be defined for each intermediate node";
		}
		else
		this.onXMLMinorError("unknown tag name <" + nodeName);
	}


	this.interface.addSelectables(this.scene, this, this.nodes_selectable);
	console.log("Parsed nodes");
	return null ;
}


/**
 * @description Called when there is an error to report
 */
SceneGraph.prototype.onXMLError = function(message) {
	console.error("XML Loading Error: " + message);
	this.loadedOk = false;
}

/**
 * @description Called when there is a warning to report
 */
SceneGraph.prototype.onXMLMinorError = function(message) {
	console.warn("Warning: " + message);
}

/**
 * @description Called when there is a simple log to report
 */
SceneGraph.prototype.log = function(message) {
	console.log("   " + message);
}

/**
 * @description Generates a default material with a random name
 */
SceneGraph.prototype.generateDefaultMaterial = function() {
	var materialDefault = new CGFappearance(this.scene);
	materialDefault.setShininess(1);
	materialDefault.setSpecular(0, 0, 0, 1);
	materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
	materialDefault.setAmbient(0, 0, 0, 1);
	materialDefault.setEmission(0, 0, 0, 1);

	// Generates random material ID not currently in use.
	this.defaultMaterialID = null;
	do this.defaultMaterialID = SceneGraph.generateRandomString(5);
	while (this.materials[this.defaultMaterialID] != null);

	this.materials[this.defaultMaterialID] = materialDefault;
}

/**
 * @description Generates a random string of specified legth
 * @param length Length of the string to generate
 * @return Generated string
 */
SceneGraph.generateRandomString = function(length) {
	// Generates an array of random integer ASCII codes of the specified length
	// and returns a string of the specified length.
	var numbers = [];
	for (var i = 0; i < length; i++)
	numbers.push(Math.floor(Math.random() * 256));          // Random ASCII code.

	return String.fromCharCode.apply(null, numbers);
}

/**
 * @description Used to start rendering the scene, handles only the root node
 */
SceneGraph.prototype.displayScene = function() {
	let child = this.nodes[this.root_id].children,
			leav = this.nodes[this.root_id].leaves,
			node = this.nodes[this.root_id],
	 		text_id = this.nodes[this.root_id].textureID,
			mat_id = this.nodes[this.root_id].materialID;

	this.scene.pushMatrix();
	node.transformMatrix = node.applyAnimations(node.transformMatrix);

	if (node.transformMatrix != null)
		this.scene.multMatrix(node.transformMatrix);

  this.scene.multMatrix(node.applyAnimations());

	for (var i = 0 ; i < leav.length ; i++)
		leav[i].render(this.materials[mat_id], this.textures[text_id], this.scene);

	for (var i = 0 ; i < child.length ; i++ )
		this.displayNodes(child[i], mat_id, text_id, (this.selected_node == this.root_id));

	this.scene.popMatrix();
}

//TODO check if calling displayNodes(this.root_id, null, null) works
/**
 * @description Handles the inheritance of nodes
 * @param node_id ID of the father node
 * @param material_id ID of the material inherited
 * @param texture_id ID of the texture inherited
 */
SceneGraph.prototype.displayNodes = function(node_id,material_id,texture_id, sel) {
	var node = this.nodes[node_id],
			mat=material_id,
			text=texture_id,
			real_sel = ((node_id === this.selected_node) || sel);

	this.scene.pushMatrix();

	if (node.transformMatrix != null)
		this.scene.multMatrix( node.transformMatrix );

  this.scene.multMatrix(node.applyAnimations());

	if ( node.materialID != "null" )
		mat = node.materialID;

	if ( node.textureID != "null" )
		text = node.textureID;

	for ( var i = 0 ; i < node.children.length ; i++ )
		this.displayNodes( node.children[i], mat, text, real_sel);
	for ( var i = 0 ; i < node.leaves.length ; i++)
		if ( text == "clear" )
			node.leaves[i].render( this.materials[mat], null, this.scene, real_sel);
		else
			node.leaves[i].render( this.materials[mat], this.textures[text], this.scene, real_sel);

	this.scene.popMatrix();
}
