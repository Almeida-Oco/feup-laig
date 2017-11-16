#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform bool uUseTexture;


uniform float normScale;
varying vec4 coords;
varying vec4 normal;


void main() {
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.
	if (uUseTexture)
	{
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = textureColor * vFinalColor;
	}
	else
		gl_FragColor = vFinalColor;

}









/*
#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
  #else
    precision mediump float;
  #endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

varying vec4 coords;
varying vec4 normal;

uniform float normScale;

uniform vec4 sel_color;

void main() {



	






	//gl_FragColor = vec4(1.0*normScale, 0.0, 0.0, 0.5);
	
//	gl_FragColor = mix(
}

/*
	if (coords.x > 0.0)
		gl_FragColor =  normal;
	else
	{
		gl_FragColor.rgb = abs(coords.xyz)/3.0;
		gl_FragColor.a = 1.0;
	}
*/


*/
