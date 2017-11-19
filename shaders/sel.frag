#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform bool uUseTexture;

uniform float normScale;

uniform float red;
uniform float green;
uniform float blue;

void main() {
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.

	vec4 sel_col = vec4(red, green, blue, 1.0);

	if (uUseTexture)
	{
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = mix(textureColor * vFinalColor, sel_col, max(normScale, 0.0));
	}
	else
		gl_FragColor = mix(vFinalColor, sel_col, max(normScale, 0.0));

}
